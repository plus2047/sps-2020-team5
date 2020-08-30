import sys
#sys.path.append("./code")
# import argparse

from .code.ismir2019_cifka.data.chop_midi import chop_midi
#from ismir2019_cifka.data.fix_key_signatures import step1
#from ismir2019_cifka.data.filter_4beats import step2
from .code.ismir2019_cifka.models.roll2seq_style import roll2seq_style
from .code.ismir2019_cifka.data.notes2midi import notes2midi
import pickle
import pathlib
import shutil


class Seq2SeqService:

    def __init__(self):
        self.style_list = {'jazz':'ZZJAZZ', 'chacha':'ZZCHACHA', 'reggae':'ZZREGGAE'}

    def run_file(self, input_path, output_path, target_style):
        if target_style not in self.style_list:
            print("unsupported style: ", target_style)
            print("style_list: ", self.style_list)
            return
        else:
            target_style = self.style_list[target_style]
        input_files = [input_path]

        step_file_1 = input_path.replace(".mid", ".pickle")
        step_file_2 = output_path.replace(".mid", ".pickle")
        output_file = output_path.replace(".mid", "/")

        output1 = list(chop_midi(files=input_files,
                            bars_per_segment=8,
                            instrument_re=None,
                            programs=None,
                            drums=True,
                            min_notes_per_segment=1,
                            include_segment_id=True,
                            force_tempo=60,
                            skip_bars=0))
        
        with open(step_file_1, 'wb') as step_file_one:
            pickle.dump(output1, step_file_one)

        with open(step_file_1, 'rb') as step_file_one:
            with open(step_file_2, 'wb') as step_file_two:
                roll2seq_style(step_file_one, step_file_two, "all2bass", target_style)
        '''
        output2bass = roll2seq_style(output1, "all2bass", target_style)
        output2piano = roll2seq_style(output1, "all2piano", target_style)
        '''
        notes2midi(step_file_2, output_file)
        shutil.copy2(output_file + pathlib.Path(input_path).name + ".mid", output_path)


if __name__ == "__main__":
    ser = Seq2SeqService()
    ser.run_file("./midi_data/allblues.mid", "./midi_data/allblues_trans.mid", "jazz")
