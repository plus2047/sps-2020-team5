import sys
# sys.path.append("./code")
# import argparse

from ismir2019_cifka.data.chop_midi import chop_midi
#from ismir2019_cifka.data.fix_key_signatures import step1
#from ismir2019_cifka.data.filter_4beats import step2
from ismir2019_cifka.models.roll2seq_style import roll2seq_style
from ismir2019_cifka.data.notes2midi import notes2midi
import pickle

if __name__ == '__main__':
    

    input_files = ["./midi_data/allblues.mid"]
    step_file_1 = "./midi_data/allblues.pickle"
    step_file_2 = "./midi_data/allblues_trans.pickle"
    output_file = "./midi_data/allblues_outputs"

    
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
            roll2seq_style(step_file_one, step_file_two)
    


    notes2midi(step_file_2, output_file)




