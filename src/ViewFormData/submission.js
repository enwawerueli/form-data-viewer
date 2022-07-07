import axios from "axios";

export default async function submission() {
  try {
    const response = await axios.get(
      "http://localhost:8002/api/form_datas/52.json"
    );
    // console.log("submission:", response.data.store);
    return response.data.store;
  } catch (error) {
    console.error(error);
  }
}
