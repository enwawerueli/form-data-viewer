import axios from "axios";

export default async function schema() {
  try {
    const response = await axios.get(
      "http://localhost:8002/api/be_forms/53.json"
    );
    // console.log("schema:", response.data.scheme);
    return response.data.scheme;
  } catch (error) {
    console.error(error);
  }
}
