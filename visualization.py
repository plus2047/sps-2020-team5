import matplotlib as mpl
mpl.use('Agg')
import matplotlib.pyplot as plt
import soundfile
import numpy as np


def visualization(input_file: str, output_path):
    if input_file.endswith("wav"):
        data, fs = soundfile.read(input_file)
        if len(data.shape) > 1:
            data = data[:, 0]
        plt_data = data[::fs // 10]
        plt_lim = np.max(np.abs(plt_data)) * 1.1
        plt.figure()
        plt.plot(plt_data)
        plt.ylim((-plt_lim, plt_lim))
    elif input_file.endswith("npy"):
        data = np.load(input_file)
        plt.matshow(data[:, :, 0])
    plt.axis("off")
    plt.savefig(output_path)