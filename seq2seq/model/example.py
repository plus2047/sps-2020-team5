import sys
sys.path.append("./code")
# import argparse

from ismir2019_cifka.data.chop_midi import chop_midi
from ismir2019_cifka.data.fix_key_signatures import step1
from ismir2019_cifka.data.filter_4beats import step2
from ismir2019_cifka.models.roll2seq_style import roll2seq_style
from ismir2019_cifka.data.notes2midi import notes2midi
import pickle

if __name__ == '__main__':
    
    input_file = "./midi_data/allblues.mid"
    step1_file = input_file.replace(".mid", "_step1.mid")
    step1(input_file, step1_file)
    if not step2(step1_file):
        print("the files to have 4/4 time only")
    
    
    '''
    #input_files = ["./midi_data/around_sax.mid"]
    #step_file_1 = "./midi_data/around_sax.pickle"
    #step_file_2 = "./midi_data/around_sax_trans.pickle"
    #output_file = "./midi_data/around_sax_outputs"
    input_files = ["./midi_data/allblues.mid"]
    step_file_1 = input_files[0].replace(".mid", ".pickle")
    step_file_2 = input_files[0].replace(".mid", "_trans.pickle")
    output_file = input_files[0].replace(".mid", "_outputs")

    
    output = list(chop_midi(files=input_files,
                            bars_per_segment=8,
                            instrument_re=None,
                            programs=None,
                            drums=True,
                            min_notes_per_segment=1,
                            include_segment_id=True,
                            force_tempo=60,
                            skip_bars=0))
    with open(step_file_1, 'wb') as step_file_one:
        pickle.dump(output, step_file_one)

    with open(step_file_1, 'rb') as step_file_one:
        with open(step_file_2, 'wb') as step_file_two:
            roll2seq_style(step_file_one, step_file_two, "all2bass")
    

    notes2midi(step_file_2, output_file)
    '''



