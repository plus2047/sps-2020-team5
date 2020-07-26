import matplotlib as mpl
mpl.use('Agg')
import matplotlib.pyplot as plt
import soundfile
import numpy as np


def visualization(bytes, output_path):
    data, fs = soundfile.read(bytes)
    plt_data = data[:, 0][::fs // 10]
    plt_lim = np.max(np.abs(plt_data)) * 1.1
    plt.figure()
    plt.plot(plt_data)
    plt.ylim((-plt_lim, plt_lim))
    plt.axis("off")
    plt.savefig(output_path)