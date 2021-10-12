import React from "react";
import ViewFormData from "./ViewFormData";
import getSchema from "./ViewFormData/schema";
import getSubmission from "./ViewFormData/submission";
import "bootstrap/dist/css/bootstrap.min.css";
import "font-awesome/css/font-awesome.css";

export default function MyApp() {
  const [schema, setSchema] = React.useState(null);
  const [submission, setSubmission] = React.useState(null);

  React.useEffect(() => {
    (async () => {
      setSchema(await getSchema());
      setSubmission(await getSubmission());
    })();
  }, []);

  return (
    <ViewFormData
      schema={schema}
      submission={submission}
      options={{ collapse: true }}
    />
  );
}
