import React from "react";
import _ from "lodash";
import axios from "axios";
import "./style.css";
// import { Accordion } from "react-bootstrap";

const Row = (props) => {
  return (
    <div className="row">
      <div className="col">{props.label}</div>
      <div className="col">
        {_.isObject(props.value) ? (
          <div className="objectview">
            {Object.keys(props.value).map((key) => (
              <div className="row" key={key}>
                <div className="col">{key}</div>
                <div className="col">{props.value[key] || "-"}</div>
              </div>
            ))}
          </div>
        ) : (
          props.value || "-"
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
const ComponentMapping = {
  // content: Content,
  datetime: Row,
  email: Email,
  file: File,
  panel: Card,
  phoneNumber: PhoneNumber,
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

  const mappedComponents = [];
  _.templateSettings.interpolate = /{{([\s\S]+?)}}/g;

  for (const component of components) {
    // Default config
    const config = {
      component: ComponentMapping[component.type] || React.Fragment,
      props: { key: component.id },
      children: [],
    };

    const props = {};
    if (config.component !== React.Fragment) {
      // Default props
      props.label = component.label;
    }
    switch (component.type) {
      case "textfield":
      case "textarea":
      case "phoneNumber":
      case "email":
      case "signature":
      case "url":
        props.value = submission[component.key];
        break;
      case "datetime":
        props.value = submission[component.key]
          ? new Date(submission[component.key]).toDateString()
          : undefined;
        break;
      case "panel":
        props.id = component.id;
        props.title = component.title;
        props.collapse = options.collapse;
        break;
      // case "content":
      //   props.html = _.template(component.html)({ data: submission });
      //   break;
      case "select":
        let selected;
        switch (component.dataSrc) {
          case "values": {
            // Let's try to find the item from the values array corresponding to the submission value
            selected = _.find(
              component.data.values,
              ({ value }) => value === submission[component.key]
            );
            if (!selected) break;
            // We found it, we use its label as our display value
            props.value = selected.label;
            break;
          }
          case "url": {
            // If the valueProperty config is not set, formio saves the item as-is to the api
            // In this case we display all the item's keys and values,.. maybe omit the 'id' key since it's not relevant for display
            if (component.valueProperty === "") {
              props.value = _.omit(submission[component.key], "id");
              break;
            }
            // Otherwise, we need to make an api request to the configured url
            let url = component.data.url;
            // Attach any configured filters as query params
            if (component.filter) {
              const q = _.template(component.filter)({ data: submission });
              url = `${url}?${q}`;
            }
            let response;
            try {
              response = await axios.get(url);
            } catch (error) {
              console.error(error);
            }
            // If selectValues is configured, we use that to extract the option items from the response
            const items = component.selectValues
              ? _.get({ results: response.data }, component.selectValues)
              : response.data;
            // Then we find which item corresponds to our submission value
            selected = _.find(
              items,
              (x) => x[component.valueProperty] === submission[component.key]
            );
            if (!selected) break;
            // We evaluate the configured template for the option's label and use the result as our display value
            props.value = _.template(component.template)({ item: selected });
            break;
          }
          default:
            break;
        }
        break;
      case "file": {
        const files = [];
        // We first check if a file was submitted
        if (!submission[component.key]) {
          props.files = [];
          break;
        }
        // We can then go throught each file in the submission and extract the values we need
        if (
          component.multiple === true ||
          Array.isArray(submission[component.key])
        ) {
          const files_ = submission[component.key].map((f) => ({
            url: f.url,
            key: f.name,
            filename: f.originalName,
            size: f.size,
          }));
          files.push(...files_);
        } else {
          files.push({
            url: submission[component.key]["url"],
            key: submission[component.key]["name"],
            filename: submission[component.key]["originalName"],
            size: submission[component.key]["size"],
          });
        }
        props.files = files;
        break;
      }
      case "container": {
        // Map the components of the container with the submission under the container's api key
        const children = await getMappedComponents(
          component.components,
          submission[component.key],
          options
        );
        mappedComponents.push({ ...config, children });
        continue;
      }
      case "datagrid": {
        // Check if any data was submitted
        if (!submission[component.key]) break;
        // Then for each item in the submission (stored under the datagrid api key in the submission),
        // map the item with the datagrid components
        for (const [i, s] of submission[component.key].entries()) {
          // console.log(i,s)
          const children = await getMappedComponents(
            component.components,
            s,
            options
          );
          mappedComponents.push({
            ...config,
            component: DataGridItem,
            props: { ...config.props, key: config.props.key + i },
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
        break;
    }
    // Merge default and computed props
    Object.assign(config.props, props);
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
  // console.log("schema:", schema);
  // console.log("submission:", submission);
  const [components, setComponents] = React.useState([]);

  React.useEffect(() => {
    (async () =>
      setComponents(
        await getMappedComponents(schema?.components, submission, options)
      ))();
  }, [schema, submission, options]);

  // console.log("components:", components);

  return RenderComponent({
    component: "div",
    children: components,
    props: { className: "container vfd" },
  });
}
