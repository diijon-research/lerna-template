# ChatGpt 4 tts

``` js
import "./styles.css";
import React, { cloneElement, Children, isValidElement } from "react";

export default function App() {
  return (
    <>
      <h3>Single Nodes</h3>
      <SingleNode>
        <div>
          <p>
            <b>Hello</b>&nbsp;
            <span>world!</span>
          </p>
        </div>
      </SingleNode>
      <SingleNode>
        <>
          Hello&nbsp;
          <span>world!</span>
        </>
      </SingleNode>
      <SingleNode>
        <>Hello world</>
      </SingleNode>
      <SingleNode>
        <div>
          <p>
            Hello, <span>world!</span>
          </p>
          <div>
            <b>Hello</b>
            <span>world!</span>
          </div>
        </div>
      </SingleNode>
      <SingleNode>Hey world</SingleNode>
      <SingleNode>
        <div>
          <div>
            <div>
              <div>
                <div>Deeply nested text</div>
                <div>
                  <span>Another child</span>
                  <a href="#">Link</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SingleNode>

      <h3>Multiple Nodes</h3>
      <MultipleNodes>
        <div>
          <p>
            <b>Hello</b>
            <span>world!</span>
          </p>
        </div>
        <div>
          <p>
            Hello, <span>world!</span>
          </p>
          <div>
            <b>Hello</b>
            <span>world!</span>
          </div>
        </div>
      </MultipleNodes>
      <MultipleNodes>
        <div>Hello World</div>
      </MultipleNodes>
    </>
  );
}

function TTSText({ children }) {
  return (
    <div style={{ border: "solid green thick", marginBottom: "5px" }}>
      {children}
    </div>
  );
}

function TTSNoMatch({ children }) {
  return (
    <div style={{ border: "solid red thick", marginBottom: "5px" }}>
      {children}
    </div>
  );
}

/**
 * chat-gpt4 prompts:
 * 1. Create a React functional component named SingleNode. SingleNode should recursively search its children for the first node that has multiple children and some are valid components. The node meeting that condition should be known as StartingTextNode. If StartingTextNode is found then StartingTextNode should be rendered, its first child should be an existing TTSText component and it should render the children of StartingTextNode. If StartingTextNode is not found then SingleNode should wrap it's children in an existing TTSNoMatch component.
 * 2. Please update `SingleNode` to render the `TTSText` component instead of the `TTSNoMatch` component.
 * 3. Can you find a way to optimize the code?
 *
 * Solution after #3 was good but had edge case where it could not handle nested structures. After a lot of back and forth, the result was this:
 */
const findStartingTextNode = (children, parent = null, foundNode = false) => {
  let result = null;
  React.Children.forEach(children, (child) => {
    if (result) return;
    
    if (React.isValidElement(child)) {
      if (foundNode || React.Children.count(child.props.children) > 1) {
        result = parent || child;
      } else {
        const foundNode = findStartingTextNode(child.props.children, parent || child);
        if (foundNode) {
          result = foundNode;
        }
      }
    }
  });
  return result;
};

const SingleNode = ({ children }) => {
  const startingTextNode = findStartingTextNode(children);
  const hasMultipleChildren = React.Children.count(startingTextNode?.props.children) > 1;

  if (startingTextNode && hasMultipleChildren) {
    return React.cloneElement(
      startingTextNode,
      {},
      <TTSText>
        {startingTextNode.props.children}
      </TTSText>
    );
  } else if (startingTextNode) {
    return React.cloneElement(
      startingTextNode,
      {},
      <SingleNode>{startingTextNode.props.children}</SingleNode>
    );
  } else {
    return <TTSText>{children}</TTSText>;
  }
};

/**
 * gpt4 Prompt: Create a React functional component named MultipleNodes. If MultipleNodes has more than one child then it should wrap each child in the MultipleNodes component. If MultipleNodes has a single child then MultipleNodes should search its children for the first child that has multiple children and wrap each of those in an existing "SingleNode" component.
 */
const MultipleNodes = ({ children }) => {
  const childArray = Children.toArray(children);

  if (childArray.length > 1) {
    // If there are multiple children, wrap each in SingleNode
    return (
      <>
        {childArray.map((child, index) => (
          // <SingleNode key={index}>{child}</SingleNode>
          <MultipleNodes key={index}>{child}</MultipleNodes>
        ))}
      </>
    );
  }

  // If MultipleNodes has a single child
  if (childArray.length === 1) {
    const singleChild = childArray[0];

    // If the single child has children
    if (React.isValidElement(singleChild) && singleChild.props.children) {
      const grandChildrenArray = React.Children.toArray(
        singleChild.props.children
      );

      // If the single child has multiple children
      if (grandChildrenArray.length > 1) {
        return React.cloneElement(
          singleChild,
          {},
          grandChildrenArray.map((grandChild, index) => (
            <SingleNode key={index}>{grandChild}</SingleNode>
          ))
        );
      }
    }
  }

  // If there is no child or there's no child with multiple children, return as it is.
  return <SingleNode>{children}</SingleNode>; //I changed this to wrap children
};

```