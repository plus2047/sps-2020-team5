from model import cyclegan
from main import process_args
import tensorflow as tf


def get_all_args():  # get all supported model config
    return {
        "jazz_classic": process_args(),
    }


class CycleganService:

    def __init__(self):
        tfconfig = tf.ConfigProto(allow_soft_placement=True)
        tfconfig.gpu_options.allow_growth = True
        self.sess = tf.Session(config=tfconfig)

        self.models = {}
        self.all_args = get_all_args()
        for key, args in self.all_args.items():
            mod = cyclegan(self.sess, args)
            mod.load_model(args)
            self.models[key] = mod


    def run_file(self, input_dir, output_dir, model_name, direction):
        if model_name not in self.models:
            print("unsupported model: ", model_name)
            print("all models: ", list(self.models.keys()))
            return
        mod = self.models[model_name]
        mod.serve(self.all_args[model_name], input_dir, output_dir)


if __name__ == "__main__":
    ser = CycleganService()
    ser.run_file("test/serve_input", "test/serve_ouptut", "jazz_classic", "AtoB")
