import React from "react";
import _ from "lodash";
import axios from "axios";
import "./style.css";
// import { Accordion } from "react-bootstrap";

const Row = (props) => {
  const { label, value } = props;

  const ScalarValue = ({ value }) => (
    <div dangerouslySetInnerHTML={{ __html: value || "-" }} />
  );

  const ObjectValue = ({ value }) => {
    value = _.omitBy(value, (value, key) => {
      return key.startsWith("@") || key === "id" || _.isObject(value);
    });
    return (
      <div className="objectview">
        {Object.entries(value).map(([key, value]) => (
          <div className="row" key={key}>
            <div className="col">{key}</div>
            <div
              className="col"
              dangerouslySetInnerHTML={{ __html: value || "-" }}
            />
          </div>
        ))}
      </div>
    );
  };

  const ArrayValue = ({ value }) =>
    value.map((value, index) => {
      return _.isObject(value) ? (
        <ObjectValue value={value} key={label + index} />
      ) : (
        <ScalarValue value={value} key={label + index} />
      );
    });

  return (
    <div className="row">
      <div className="col">{label}</div>
      <div className="col">
        {Array.isArray(value) ? (
          <ArrayValue value={value} />
        ) : _.isObject(value) ? (
          <ObjectValue value={value} />
        ) : (
          <ScalarValue value={value} />
        )}
      </div>
    </div>
  );
};

const PhoneNumber = (props) => {
  return (
    <div className="row">
      <div className="col">{props.label}</div>
      <div className="col">
        {props.value ? (
          <a href={`tel:${props.value}`}>
            <span className="fa fa-phone"></span>&nbsp;{props.value}
          </a>
        ) : (
          "-"
        )}
      </div>
    </div>
  );
};

const Email = (props) => {
  return (
    <div className="row">
      <div className="col">{props.label}</div>
      <div className="col">
        {props.value ? (
          <a href={`mailto:${props.value}`}>
            <span className="fa fa-envelope-o"></span>&nbsp;{props.value}
          </a>
        ) : (
          "-"
        )}
      </div>
    </div>
  );
};

const Url = (props) => {
  return (
    <div className="row">
      <div className="col">{props.label}</div>
      <div className="col">
        {props.value ? (
          <a href={props.value}>
            <span className="fa fa-external-link"></span>&nbsp;{props.value}
          </a>
        ) : (
          "-"
        )}
      </div>
    </div>
  );
};

const Signature = (props) => {
  return (
    <div className="row">
      <div className="col">{props.label}</div>
      <div className="col signature">
        {props.value ? (
          <div>
            <img src={props.value} alt="" />
          </div>
        ) : (
          "-"
        )}
      </div>
    </div>
  );
};

const File = (props) => {
  const formatBytes = (bytes, decimals = 1) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
  };

  return (
    <div className="row">
      <div className="col">{props.label}</div>
      <div className="col fileinfo">
        <div>
          <div className="row">
            <div className="col">File Name</div>
            <div className="col">Size</div>
          </div>
          {props.files?.map((f) => (
            <div className="row" key={f.key}>
              <div className="col">
                <a href={f.url}>{f.filename}</a>
              </div>
              <div className="col">{f.size >= 0 && formatBytes(f.size)}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const Card = (props) => {
  const [collapse, setCollapse] = React.useState(props.collapse ?? false);

  // return (
  //   <Accordion.Item eventKey={props.id}>
  //     <Accordion.Header>{props.title}</Accordion.Header>
  //     <Accordion.Body>{props.children}</Accordion.Body>
  //   </Accordion.Item>
  // );

  return (
    <div id={`accordion-${props.id}`}>
      <div className="card">
        <div className="card-header">
          <button
            className="btn btn-link"
            data-toggle="collapse"
            data-target={`#${props.id}`}
            onClick={() => setCollapse((collapse) => !collapse)}
          >
            <span
              className={`fa fa-${collapse ? "plus" : "minus"}-square-o`}
            ></span>
            &nbsp;
            {props.title}
          </button>
        </div>
        <div
          id={props.id}
          className={`collapse ${!collapse && "show"}`}
          data-parent={`accordion-${props.id}`}
        >
          <div className="card-body">{props.children}</div>
        </div>
      </div>
    </div>
  );
};

const Content = (props) => {
  return (
    <div className="row">
      <div
        className="col"
        dangerouslySetInnerHTML={{ __html: props.html }}
      ></div>
    </div>
  );
};

const DataGridItem = (props) => {
  return <div className="datagrid-item">{props.children}</div>;
};

/**
 * A mapping of schema component types to components to render
 */
const componentMapping = {
  container: Row,
  content: Content,
  datetime: Row,
  email: Email,
  file: File,
  panel: Card,
  phoneNumber: PhoneNumber,
  radio: Row,
  select: Row,
  signature: Signature,
  textarea: Row,
  textfield: Row,
  url: Url,
};

/**
 * Maps a schema definition to a list of config objects with props computed from the schema and the given submission
 *
 * @param {object} components The schema definition of the components
 * @param {object} submission A form submission made with the given schema
 * @returns A list of config objects defining each mapping
 */
const getMappedComponents = async (components, submission, options = {}) => {
  if (!components || !submission) return [];
  _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;
  const mappedComponents = [];
  for (const component of components) {
    // Skip hidden components
    // if (component.hidden === true) continue;
    // Default config
    const config = {
      component: componentMapping[component.type] || React.Fragment,
      props: { key: component.id },
      children: [],
    };
    // Computed props will be used to render the mapped component
    const props = {};
    if (config.component !== React.Fragment) {
      // Default props
      props.label = component.label;
    }
    const submissionValue = submission[component.key];
    switch (component.type) {
      case "textfield":
      case "textarea":
      case "phoneNumber":
      case "email":
      case "radio":
      case "signature":
      case "url":
        props.value = submissionValue;
        break;
      case "datetime":
        props.value = submissionValue
          ? new Date(submissionValue).toDateString()
          : "";
        break;
      case "panel":
        props.id = component.id;
        props.title = component.title;
        props.collapse = options.collapse;
        break;
      case "content":
        props.html = _.template(component.html)({ data: submission });
        break;
      case "select": {
        let selected = null;
        switch (component.dataSrc) {
          case "values": {
            // Let's try to find the item from the values array that matches the submission value
            selected = component.data.values.find(
              ({ value }) => value === submissionValue
            );
            // If we found it, use its label as our display value, otherwise use the submission value
            props.value = selected?.label || submissionValue;
            break;
          }
          case "url": {
            if (component.valueProperty === "") {
              // If the valueProperty config is not set, formio saves the option item as is
              selected = submissionValue;
            } else {
              // Otherwise, we need to make an api request to the configured url
              let url = component.data.url;
              // Attach any configured filters as query params
              if (component.filter) {
                const q = _.template(component.filter)({ data: submission });
                url = `${url}?${q}`;
              }
              try {
                const response = await axios.get(url);
                // If selectValues is configured, we use this key as our accessor for the option items
                const options = component.selectValues
                  ? _.get(response.data, component.selectValues)
                  : response.data;
                // Let's find the option that mathches our submission value
                selected = options?.find(
                  (o) => o[component.valueProperty] === submissionValue
                );
              } catch (error) {
                console.error(error);
              }
              // We fall back to the submision value if we didn't find a match
              if (!selected) {
                selected = {
                  [component.valueProperty]: submissionValue,
                };
              }
            }
            // We evaluate the configured template for the option's label and use the result as our display value
            if (component.multiple === true && Array.isArray(selected)) {
              props.value = selected.map((item) =>
                _.template(component.template)({ item })
              );
            } else {
              props.value = _.template(component.template)({ item: selected });
            }
            break;
          }
          default:
        }
        break;
      }
      case "file": {
        // We first check if a file was submitted
        if (
          !submissionValue ||
          (Array.isArray(submissionValue) && submissionValue.length === 0)
        ) {
          props.files = [];
          break;
        }
        // We then go through each file in the submission and extract the properties we need
        let files;
        if (component.multiple === true && Array.isArray(submissionValue)) {
          files = submissionValue.map((file) => ({
            filename: file.originalName,
            size: file.size,
            url: file.url,
            key: file.name,
          }));
        } else {
          files = [
            {
              filename: submissionValue.originalName,
              size: submissionValue.size,
              url: submissionValue.url,
              key: submissionValue.name,
            },
          ];
        }
        props.files = files;
        break;
      }
      case "container": {
        // Map the components of the container with the submission under the container's key
        const children = await getMappedComponents(
          component.components,
          submissionValue,
          options
        );
        mappedComponents.push({
          ...config,
          props: { ...config.props, ...props },
          children,
        });
        continue;
      }
      case "datagrid": {
        // Check if any data was submitted
        if (submissionValue.length === 0) break;
        // For each item in the submission map the datagrid components with this item
        for (const [index, value] of submissionValue.entries()) {
          const children = await getMappedComponents(
            component.components,
            value,
            options
          );
          mappedComponents.push({
            ...config,
            component: DataGridItem,
            props: { ...config.props, key: config.props.key + index },
            children,
          });
        }
        continue;
      }
      case "columns": {
        // Merge the components in the columns array into a flat array and map them recursively
        const children = await getMappedComponents(
          component.columns.flatMap((c) => c.components).filter((c) => c),
          submission,
          options
        );
        mappedComponents.push({ ...config, children });
        continue;
      }
      default:
    }
    // Merge default and computed props
    config.props = { ...config.props, ...props };
    // If the component has nested child components, map them recursively
    if (component.components?.length > 0) {
      const children = await getMappedComponents(
        component.components,
        submission,
        options
      );
      mappedComponents.push({ ...config, children });
    } else {
      mappedComponents.push(config);
    }
  }
  return mappedComponents;
};

/**
 * Renders a component and its children recursively
 *
 * @param {object} config The component's config
 * @returns A react element node
 */
const RenderComponent = ({ component, props, children }) => {
  return React.createElement(
    component,
    props,
    children.map((c) => RenderComponent(c))
  );
};

/**
 * This is the top level component for rendering a form submission
 * Receices a submission, the corresponding form schema and an options object as props
 *
 * @param {object} props
 * @returns A react element node
 */
export default function ViewFormData(props) {
  const { schema, submission, options } = props;
  console.log("schema:", schema);
  console.log("submission:", submission);
  const [components, setComponents] = React.useState([]);

  React.useEffect(() => {
    (async () =>
      setComponents(
        await getMappedComponents(schema?.components, submission, options)
      ))();
  }, [schema, submission, options]);

  console.log("components:", components);

  return RenderComponent({
    component: "div",
    children: components,
    props: { className: "vfd" },
  });
}
