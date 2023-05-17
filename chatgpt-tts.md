# ChatGpt 4 tts

``` js
import "./styles.css";
import React, { cloneElement, Children, isValidElement } from "react";
import * as ReactIs from "react-is";

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
                <div style={{ textDecoration: "underline" }}>
                  Deeply nested text
                </div>
                <div style={{ textDecoration: "green wavy underline" }}>
                  <span>Another child</span>
                  <a href="#">Link</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SingleNode>
      <div data-component="SpeechBubble">
        <div data-component="SpeechBubbleTitle">
          <SingleNode>Mark</SingleNode>
        </div>
        <div data-component="SpeechBubbleContent">
          <MultipleNodes>
            <p>First sentence</p>
            <p>Second sentence</p>
          </MultipleNodes>
        </div>
      </div>

      <h3>Multiple Nodes</h3>
      <MultipleNodes>
        <div data-node="1">
          <div data-node="2">
            <div data-node="3">
              <div data-node="hasMultipleChildren">
                <div style={{ textDecoration: "underline" }}>
                  Deeply nested text
                </div>
                <div style={{ textDecoration: "green wavy underline" }}>
                  <span>Another child</span>
                  <a href="#">Link</a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </MultipleNodes>
      <MultipleNodes>
        <div>
          <p data-node="hasMultipleChildren">
            <b>Hello</b>
            <span>world!</span>
          </p>
        </div>
        <div data-node="hasMultipleChildren">
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
      <MultipleNodes>
        <div data-component="Box">
          <span>Your Team</span>
        </div>
        <div data-component="Box">
          <div data-component="SpeechBubble" data-node="hasMultipleChildren">
            <div data-component="SpeechBubbleTitle">Bethxx</div>
            <div data-component="SpeechBubbleContent">
              <></>
            </div>
          </div>
        </div>
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
 * Solution after #3 was good but had edge case where it could not handle nested structures
 */
const findStartingTextNode = (children, parent = null, foundNode = false) => {
  let result = null;
  React.Children.forEach(children, (child) => {
    if (result) return;

    if (React.isValidElement(child)) {
      if (foundNode || React.Children.count(child.props.children) > 1) {
        result = parent || child;
      } else {
        const foundNode = findStartingTextNode(
          child.props.children,
          parent || child
        );
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
  const hasMultipleChildren =
    React.Children.count(startingTextNode?.props.children) > 1;

  if (startingTextNode && hasMultipleChildren) {
    return React.cloneElement(
      startingTextNode,
      {},
      <TTSText>{startingTextNode.props.children}</TTSText>
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
  // Check if children exist
  if (!children) {
    return null;
  }

  const renderChildren = (child) => {
    if (React.isValidElement(child) && child.props.children) {
      const childChildren = Children.toArray(child.props.children);

      // Combine two checks into one
      const hasStringChild = childChildren.some(
        (subChild) =>
          typeof subChild === "string" ||
          (React.isValidElement(subChild) && !subChild.props.children)
      );

      if (hasStringChild) {
        // Wrap them together in a single SingleNode

        const nodeToRender = child.props.children;
        const isFragment = ReactIs.typeOf(nodeToRender) === ReactIs.Fragment;

        if (
          isFragment &&
          !Children.toArray(nodeToRender.props.children).length
        ) {
          return child;
        }

        return cloneElement(
          child,
          {},
          <SingleNode>{child.props.children}</SingleNode>
        );
      } else {
        // Check if child's children need to be modified
        const newChildren = childChildren.map(renderChildren);

        // Only clone element if children need to be modified
        if (newChildren.some((newChild, i) => newChild !== childChildren[i])) {
          return cloneElement(child, {}, newChildren);
        }
      }
    }

    // If no modifications are needed, return the original child
    return child;
  };

  return Children.map(children, renderChildren);
};
```