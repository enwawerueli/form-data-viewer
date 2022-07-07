import axios from "axios";

export default async function schema() {
  try {
    const response = await axios.get(
      "http://localhost:8002/api/forms/54.json"
    );
    // console.log("schema:", response.data.scheme);
    return response.data.scheme;
  } catch (error) {
    console.error(error);
  }
}
