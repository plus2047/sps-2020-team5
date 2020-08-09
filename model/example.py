import sys
sys.path.append("/Users/monika/Github/ismir2019-music-style-translation/code")
import argparse

from ismir2019_cifka.data.chop_midi import chop_midi
#from ismir2019_cifka.data.fix_key_signatures import step1
#from ismir2019_cifka.data.filter_4beats import step2
#from ismir2019_cifka.models.roll2seq_style import roll2seq_style
from ismir2019_cifka.data.notes2midi import notes2midi
import pickle

if __name__ == '__main__':
    

    input_files = ["/Users/monika/Downloads/Bodhidharma_MIDI/MIDI_Files/allblues.mid"]
    step_file_1 = "/Users/monika/Downloads/Bodhidharma_MIDI/allblues.pickle"
    step_file_2 = "/Users/monika/Downloads/Bodhidharma_MIDI/allblues_trans.pickle"
    output_file = "/Users/monika/Downloads/Bodhidharma_MIDI/allblues_outputs"

    
    output = list(chop_midi(files=input_files,
                            bars_per_segment=8,
                            instrument_re=None,
                            programs=None,
                            drums=True,
                            min_notes_per_segment=1,
                            include_segment_id=True,
                            force_tempo=60,
                            skip_bars=0))
    with open(step_file_1, 'wb') as step_file_1:
        pickle.dump(output, step_file_1)


    roll2seq_style(step_file_1, step_file_2)
    
    
    notes2midi(step_file_1, output_file)




