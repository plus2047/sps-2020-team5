#!/usr/bin/env python3
import argparse
import logging
import os
import pickle

import coloredlogs
import tensorflow as tf

from museflow.components import EmbeddingLayer, RNNLayer, RNNDecoder
from museflow.config import Configuration, configurable
from museflow.model_utils import (DatasetManager, create_train_op, prepare_train_and_val_data,
                                  make_simple_dataset, set_random_seed)
from museflow.nn.rnn import InputWrapper
from museflow.trainer import BasicTrainer
from museflow.vocabulary import Vocabulary

from ismir2019_cifka.models.common import load_data


LOGGER = logging.getLogger('ismir2019_cifka')


@configurable(['embedding_layer', 'style_embedding_layer', '2d_layers', '1d_layers', 'encoder',
               'state_projection', 'decoder', 'attention_mechanism', 'training'])
class CNNRNNSeq2Seq:

    def __init__(self, dataset_manager, train_mode, vocabulary, style_vocabulary,
                 sampling_seed=None):
        self._train_mode = train_mode
        self._is_training = tf.placeholder_with_default(False, [], name='is_training')

        self.dataset_manager = dataset_manager

        inputs, self.style_id, decoder_inputs, decoder_targets = self.dataset_manager.get_batch()
        batch_size = tf.shape(inputs)[0]

        layers_2d = self._cfg['2d_layers'].maybe_configure() or []
        layers_1d = self._cfg['1d_layers'].maybe_configure() or []

        features = inputs
        if layers_2d:
            # Expand to 4 dimensions: [batch_size, rows, time, channels]
            features = tf.expand_dims(features, -1)

            # 2D layers: 4 -> 4 dimensions
            for layer in layers_2d:
                LOGGER.debug(f'Inputs to layer {layer} have shape {features.shape}')
                features = self._apply_layer(layer, features)
            LOGGER.debug(f'After the 2D layers, the features have shape {features.shape}')

            # Features have shape [batch_size, rows, time, channels]. Switch rows and cols, then
            # flatten rows and channels to get 3 dimensions: [batch_size, time, new_channels].
            features = tf.transpose(features, perm=[0, 2, 1, *range(3, features.shape.ndims)])
            num_channels = features.shape[2] * features.shape[3]
            features = tf.reshape(features, [batch_size, -1, num_channels])

        # 1D layers: 3 -> 3 dimensions: [batch_size, time, channels]
        for layer in layers_1d:
            LOGGER.debug(f'Inputs to layer {layer} have shape {features.shape}')
            features = self._apply_layer(layer, features)

        encoder = self._cfg['encoder'].configure(RNNLayer,
                                                 training=self._is_training,
                                                 name='encoder')
        encoder_states, encoder_final_state = encoder.apply(features)

        embeddings = self._cfg['embedding_layer'].configure(
            EmbeddingLayer, input_size=len(vocabulary))

        style_embeddings = self._cfg['style_embedding_layer'].configure(
            EmbeddingLayer, input_size=len(style_vocabulary), name='style_embedding')
        self.style_vector = style_embeddings.embed(self.style_id)

        def cell_wrap_fn(cell):
            """Wrap the RNN cell in order to pass the style embedding as input."""
            return InputWrapper(cell, input_fn=lambda _: self.style_vector)

        with tf.variable_scope('attention'):
            attention = self._cfg['attention_mechanism'].maybe_configure(memory=encoder_states)
        self.decoder = self._cfg['decoder'].configure(RNNDecoder,
                                                      vocabulary=vocabulary,
                                                      embedding_layer=embeddings,
                                                      attention_mechanism=attention,
                                                      cell_wrap_fn=cell_wrap_fn,
                                                      training=self._is_training)

        state_projection = self._cfg['state_projection'].configure(
            tf.layers.Dense, units=self.decoder.initial_state_size, name='state_projection')
        decoder_initial_state = state_projection(encoder_final_state)

        # Build the training version of the decoder and the training ops
        self.training_ops = None
        if train_mode:
            _, self.loss = self.decoder.decode_train(decoder_inputs, decoder_targets,
                                                     initial_state=decoder_initial_state)
            self.training_ops = self._make_train_ops()

        # Build the sampling and greedy version of the decoder
        self.softmax_temperature = tf.placeholder(tf.float32, [], name='softmax_temperature')
        self.sample_outputs, self.sample_final_state = self.decoder.decode(
            mode='sample',
            softmax_temperature=self.softmax_temperature,
            initial_state=decoder_initial_state,
            batch_size=batch_size,
            random_seed=sampling_seed)
        self.greedy_outputs, self.greedy_final_state = self.decoder.decode(
            mode='greedy',
            initial_state=decoder_initial_state,
            batch_size=batch_size)

    def _make_train_ops(self):
        train_op = self._cfg['training'].configure(create_train_op, loss=self.loss)
        init_op = tf.global_variables_initializer()

        tf.summary.scalar('train/loss', self.loss)
        train_summary_op = tf.summary.merge_all()

        return BasicTrainer.TrainingOps(loss=self.loss,
                                        train_op=train_op,
                                        init_op=init_op,
                                        summary_op=train_summary_op,
                                        training_placeholder=self._is_training)

    def _apply_layer(self, layer, features):
        if isinstance(layer, (tf.layers.Dropout, tf.keras.layers.Dropout)):
            return layer(features, training=self._is_training)
        return layer(features)

    def run(self, session, dataset, sample=False, softmax_temperature=1.):
        _, output_ids_tensor = self.sample_outputs if sample else self.greedy_outputs

        return self.dataset_manager.run_over_dataset(
            session, output_ids_tensor, dataset,
            feed_dict={self.softmax_temperature: softmax_temperature},
            concat_batches=True)


@configurable(pass_kwargs=False)
class TranslationExperiment:

    def __init__(self, logdir, train_mode):
        set_random_seed(self._cfg.get('random_seed', None))

        self.input_encoding = self._cfg['input_encoding'].configure()
        self.output_encoding = self._cfg['output_encoding'].configure()
        with open(self._cfg.get('style_list')) as f:
            style_list = [line.rstrip('\n') for line in f]
        self.style_vocabulary = Vocabulary(
            style_list, pad_token=None, start_token=None, end_token=None)

        self.input_shapes = ([self.input_encoding.num_rows, None], [], [None], [None])
        self.input_types = (tf.float32, tf.int32, tf.int32, tf.int32)
        self.dataset_manager = DatasetManager(
            output_types=self.input_types,
            output_shapes=tuple([None, *shape] for shape in self.input_shapes))

        self.model = self._cfg['model'].configure(CNNRNNSeq2Seq,
                                                  dataset_manager=self.dataset_manager,
                                                  train_mode=train_mode,
                                                  vocabulary=self.output_encoding.vocabulary,
                                                  style_vocabulary=self.style_vocabulary)
        self.trainer = self._cfg['trainer'].configure(BasicTrainer,
                                                      dataset_manager=self.dataset_manager,
                                                      training_ops=self.model.training_ops,
                                                      logdir=logdir,
                                                      write_summaries=train_mode)

        self._load_data_kwargs = dict(input_encoding=self.input_encoding,
                                      output_encoding=self.output_encoding,
                                      style_vocabulary=self.style_vocabulary)

        if train_mode:
            # Configure the dataset manager with the training and validation data.
            self._cfg['data_prep'].configure(
                prepare_train_and_val_data,
                dataset_manager=self.dataset_manager,
                train_generator=self._cfg['train_data'].configure(
                    load_data, log=True, **self._load_data_kwargs),
                val_generator=self._cfg['val_data'].configure(
                    load_data, **self._load_data_kwargs),
                output_types=self.input_types,
                output_shapes=self.input_shapes)

    def train(self, args):
        LOGGER.info('Starting training.')
        self.trainer.train()

    def run(self, args):
        self.trainer.load_variables(checkpoint_file=args.checkpoint)
        data = pickle.load(args.input_file)

        def generator():
            style_id = self.style_vocabulary.to_id(args.target_style)
            for example in data:
                segment_id, notes = example
                yield self.input_encoding.encode(notes), style_id, [], []

        dataset = make_simple_dataset(
            generator,
            output_types=self.input_types,
            output_shapes=self.input_shapes,
            batch_size=args.batch_size)

        output_ids = self.model.run(
            self.trainer.session, dataset, args.sample, args.softmax_temperature)
        outputs = [(segment_id, self.output_encoding.decode(seq))
                   for seq, (segment_id, _) in zip(output_ids, data)]

        pickle.dump(outputs, args.output_file)


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--logdir', type=str, required=True, help='model directory')
    parser.set_defaults(train_mode=False)
    subparsers = parser.add_subparsers(title='action')

    subparser = subparsers.add_parser('train')
    subparser.set_defaults(func=TranslationExperiment.train, train_mode=True)

    subparser = subparsers.add_parser('run')
    subparser.set_defaults(func=TranslationExperiment.run)
    subparser.add_argument('input_file', type=argparse.FileType('rb'), metavar='INPUTFILE')
    subparser.add_argument('output_file', type=argparse.FileType('wb'), metavar='OUTPUTFILE')
    subparser.add_argument('target_style', type=str, metavar='STYLE')
    subparser.add_argument('--checkpoint', default=None, type=str)
    subparser.add_argument('--batch-size', default=32, type=int)
    subparser.add_argument('--sample', action='store_true')
    subparser.add_argument('--softmax-temperature', default=1., type=float)
    args = parser.parse_args()

    config_file = os.path.join(args.logdir, 'model.yaml')
    with open(config_file, 'rb') as f:
        config = Configuration.from_yaml(f)
    LOGGER.debug(config)

    experiment = config.configure(TranslationExperiment,
                                  logdir=args.logdir, train_mode=args.train_mode)
    args.func(experiment, args)


def roll2seq_style(input_file, output_file):
    parser = argparse.ArgumentParser()
    
    parser.set_defaults(logdir="/Users/monika/Github/ismir2019-music-style-translation/experiments/all2bass")
    parser.set_defaults(train_mode=False)
    parser.set_defaults(func=TranslationExperiment.run)
    parser.set_defaults(input_file=input_file, type=argparse.FileType('rb'), metavar='INPUTFILE')
    parser.set_defaults(output_file=output_file, type=argparse.FileType('wb'), metavar='OUTPUTFILE')
    parser.set_defaults(target_style="ZZREGGAE", type=str, metavar='STYLE')
    parser.set_defaults(checkpoint=None, type=str)
    parser.set_defaults(batch_size=32, type=int)
    parser.set_defaults(sample=False)
    parser.set_defaults(softmax_temperature=1., type=float)
    args = parser.parse_args()
    config_file = os.path.join(args.logdir, 'model.yaml')
    with open(config_file, 'rb') as f:
        config = Configuration.from_yaml(f)

    experiment = config.configure(TranslationExperiment,
                                  logdir=args.logdir, train_mode=args.train_mode)
    args.func(experiment, args)


if __name__ == '__main__':
    coloredlogs.install(level='DEBUG', logger=logging.root, isatty=True)
    logging.getLogger('tensorflow').handlers.clear()
    main()
