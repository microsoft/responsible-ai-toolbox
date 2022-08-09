// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { IVisionExplanationDashboardData } from "@responsible-ai/core-ui";

<<<<<<< HEAD
import { explanation } from "./explanation";

export const visionData: IVisionExplanationDashboardData = {
  classNames: ["Water Tower", "not Water Tower"],
  images: [
    "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
    "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
    "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
    "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
    "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
    "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
    "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
    "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
    "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
    "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
    "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
    "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
    "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
    "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
    "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
    "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
    "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
    "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
    "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
    "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
    "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
    "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
    "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
    "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
    "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
    "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
    "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
    "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
    "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg",
    "https://raw.githubusercontent.com/slundberg/shap/master/data/imagenet50/sim_n03029197_6381.jpg"
  ],
  localExplanations: [explanation],
=======
export const visionData: IVisionExplanationDashboardData = {
  classNames: ["duck", "not duck"],
  images: [
    "https://th.bing.com/th/id/R.ee6c3b5dda7aba5c34b372bd8409ac49?rik=K%2bmc9gcjVhhYbQ&riu=http%3a%2f%2fclipart-library.com%2fimages%2fBigAn7qMT.jpg&ehk=SNzySL548vPVf1a8PSz5Gv%2bJXdUyh%2bf2VAPT5oVuLtg%3d&risl=&pid=ImgRaw&r=0",
    "https://th.bing.com/th/id/R.ee6c3b5dda7aba5c34b372bd8409ac49?rik=K%2bmc9gcjVhhYbQ&riu=http%3a%2f%2fclipart-library.com%2fimages%2fBigAn7qMT.jpg&ehk=SNzySL548vPVf1a8PSz5Gv%2bJXdUyh%2bf2VAPT5oVuLtg%3d&risl=&pid=ImgRaw&r=0",
    "https://th.bing.com/th/id/R.ee6c3b5dda7aba5c34b372bd8409ac49?rik=K%2bmc9gcjVhhYbQ&riu=http%3a%2f%2fclipart-library.com%2fimages%2fBigAn7qMT.jpg&ehk=SNzySL548vPVf1a8PSz5Gv%2bJXdUyh%2bf2VAPT5oVuLtg%3d&risl=&pid=ImgRaw&r=0",
    "https://th.bing.com/th/id/R.ee6c3b5dda7aba5c34b372bd8409ac49?rik=K%2bmc9gcjVhhYbQ&riu=http%3a%2f%2fclipart-library.com%2fimages%2fBigAn7qMT.jpg&ehk=SNzySL548vPVf1a8PSz5Gv%2bJXdUyh%2bf2VAPT5oVuLtg%3d&risl=&pid=ImgRaw&r=0",
    "https://th.bing.com/th/id/R.ee6c3b5dda7aba5c34b372bd8409ac49?rik=K%2bmc9gcjVhhYbQ&riu=http%3a%2f%2fclipart-library.com%2fimages%2fBigAn7qMT.jpg&ehk=SNzySL548vPVf1a8PSz5Gv%2bJXdUyh%2bf2VAPT5oVuLtg%3d&risl=&pid=ImgRaw&r=0",
    "https://th.bing.com/th/id/R.ee6c3b5dda7aba5c34b372bd8409ac49?rik=K%2bmc9gcjVhhYbQ&riu=http%3a%2f%2fclipart-library.com%2fimages%2fBigAn7qMT.jpg&ehk=SNzySL548vPVf1a8PSz5Gv%2bJXdUyh%2bf2VAPT5oVuLtg%3d&risl=&pid=ImgRaw&r=0",
    "https://th.bing.com/th/id/R.ee6c3b5dda7aba5c34b372bd8409ac49?rik=K%2bmc9gcjVhhYbQ&riu=http%3a%2f%2fclipart-library.com%2fimages%2fBigAn7qMT.jpg&ehk=SNzySL548vPVf1a8PSz5Gv%2bJXdUyh%2bf2VAPT5oVuLtg%3d&risl=&pid=ImgRaw&r=0",
    "https://th.bing.com/th/id/R.ee6c3b5dda7aba5c34b372bd8409ac49?rik=K%2bmc9gcjVhhYbQ&riu=http%3a%2f%2fclipart-library.com%2fimages%2fBigAn7qMT.jpg&ehk=SNzySL548vPVf1a8PSz5Gv%2bJXdUyh%2bf2VAPT5oVuLtg%3d&risl=&pid=ImgRaw&r=0",
    "https://th.bing.com/th/id/R.ee6c3b5dda7aba5c34b372bd8409ac49?rik=K%2bmc9gcjVhhYbQ&riu=http%3a%2f%2fclipart-library.com%2fimages%2fBigAn7qMT.jpg&ehk=SNzySL548vPVf1a8PSz5Gv%2bJXdUyh%2bf2VAPT5oVuLtg%3d&risl=&pid=ImgRaw&r=0",
    "https://th.bing.com/th/id/R.ee6c3b5dda7aba5c34b372bd8409ac49?rik=K%2bmc9gcjVhhYbQ&riu=http%3a%2f%2fclipart-library.com%2fimages%2fBigAn7qMT.jpg&ehk=SNzySL548vPVf1a8PSz5Gv%2bJXdUyh%2bf2VAPT5oVuLtg%3d&risl=&pid=ImgRaw&r=0",
    "https://th.bing.com/th/id/R.ee6c3b5dda7aba5c34b372bd8409ac49?rik=K%2bmc9gcjVhhYbQ&riu=http%3a%2f%2fclipart-library.com%2fimages%2fBigAn7qMT.jpg&ehk=SNzySL548vPVf1a8PSz5Gv%2bJXdUyh%2bf2VAPT5oVuLtg%3d&risl=&pid=ImgRaw&r=0",
    "https://th.bing.com/th/id/R.ee6c3b5dda7aba5c34b372bd8409ac49?rik=K%2bmc9gcjVhhYbQ&riu=http%3a%2f%2fclipart-library.com%2fimages%2fBigAn7qMT.jpg&ehk=SNzySL548vPVf1a8PSz5Gv%2bJXdUyh%2bf2VAPT5oVuLtg%3d&risl=&pid=ImgRaw&r=0",
    "https://th.bing.com/th/id/R.ee6c3b5dda7aba5c34b372bd8409ac49?rik=K%2bmc9gcjVhhYbQ&riu=http%3a%2f%2fclipart-library.com%2fimages%2fBigAn7qMT.jpg&ehk=SNzySL548vPVf1a8PSz5Gv%2bJXdUyh%2bf2VAPT5oVuLtg%3d&risl=&pid=ImgRaw&r=0",
    "https://th.bing.com/th/id/R.ee6c3b5dda7aba5c34b372bd8409ac49?rik=K%2bmc9gcjVhhYbQ&riu=http%3a%2f%2fclipart-library.com%2fimages%2fBigAn7qMT.jpg&ehk=SNzySL548vPVf1a8PSz5Gv%2bJXdUyh%2bf2VAPT5oVuLtg%3d&risl=&pid=ImgRaw&r=0",
    "https://th.bing.com/th/id/OIP.5hk5_K6MD4JmD0Aqvv0P-wHaHa?pid=ImgDet&rs=1",
    "https://th.bing.com/th/id/OIP.5hk5_K6MD4JmD0Aqvv0P-wHaHa?pid=ImgDet&rs=1",
    "https://th.bing.com/th/id/OIP.5hk5_K6MD4JmD0Aqvv0P-wHaHa?pid=ImgDet&rs=1",
    "https://th.bing.com/th/id/OIP.5hk5_K6MD4JmD0Aqvv0P-wHaHa?pid=ImgDet&rs=1",
    "https://th.bing.com/th/id/OIP.5hk5_K6MD4JmD0Aqvv0P-wHaHa?pid=ImgDet&rs=1",
    "https://th.bing.com/th/id/OIP.5hk5_K6MD4JmD0Aqvv0P-wHaHa?pid=ImgDet&rs=1",
    "https://th.bing.com/th/id/OIP.5hk5_K6MD4JmD0Aqvv0P-wHaHa?pid=ImgDet&rs=1",
    "https://th.bing.com/th/id/OIP.5hk5_K6MD4JmD0Aqvv0P-wHaHa?pid=ImgDet&rs=1",
    "https://th.bing.com/th/id/OIP.5hk5_K6MD4JmD0Aqvv0P-wHaHa?pid=ImgDet&rs=1",
    "https://th.bing.com/th/id/OIP.5hk5_K6MD4JmD0Aqvv0P-wHaHa?pid=ImgDet&rs=1",
    "https://th.bing.com/th/id/OIP.5hk5_K6MD4JmD0Aqvv0P-wHaHa?pid=ImgDet&rs=1",
    "https://th.bing.com/th/id/OIP.5hk5_K6MD4JmD0Aqvv0P-wHaHa?pid=ImgDet&rs=1"
  ],
  localExplanations: [
    0, 0.5, 0, 0, -0.6, 0, 0.4, -0.9, 0, -0.3, 0, 0, 0.3, 0, 0, 0.4, 0, 0, -0.2,
    0, 0, 0.5, 0, 0, -0.6, 0, 0, 0, 0, -0.2, 0, 0, 0, -0.3, 0, 0, 0, 0, 0, 0
  ],
>>>>>>> 46e04a056f03bc313b9772a6b29c79a92f937530
  prediction: [0, 1]
};
