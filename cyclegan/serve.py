from .model import cyclegan
from .main import process_args
import tensorflow as tf


def get_all_args():  # get all supported model config
    jc_args = process_args()
    jc_args.checkpoint_dir = "cyclegan/checkpoint/JC_J2JC_C_2020-08-03_base_0.0/"
    # cp_args = process_args()
    # cp_args.checkpoint_dir = "cyclegan/checkpoint/CP_C2CP_P_2020-08-29_base_0.0/"
    # jp_args = process_args()
    # jp_args.checkpoint_dir = "cyclegan/checkpoint/JP_J2JP_P_2020-08-29_base_0.0/"

    return {
        "jazz_classic": jc_args,
        # "jazz_pop": jp_args,
        # "classic_pop": cp_args
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
