#!/usr/bin/env python3
"""Given a list of MIDI files, filter them to include only those in 4/4 time."""

import sys
import pretty_midi


def main():
    files = sys.argv[1:]

    for fname in files:
        midi = pretty_midi.PrettyMIDI(fname)
        if len(midi.time_signature_changes) != 1:
            continue
        ts = midi.time_signature_changes[0] 
        if ts.numerator == 4 and ts.denominator == 4:
            print(fname, flush=True)

def step2(input_file):
    midi = pretty_midi.PrettyMIDI(input_file)
    if len(midi.time_signature_changes) != 1:
        return False
    ts = midi.time_signature_changes[0] 
    if ts.numerator == 4 and ts.denominator == 4:
        return True
    return False



if __name__ == '__main__':
    main()
