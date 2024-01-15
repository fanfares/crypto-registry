import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { materialLight } from 'react-syntax-highlighter/dist/esm/styles/prism';

const CodeBoxComponent = (
  {codeString}: { codeString: string }
) => {
  return (
    <SyntaxHighlighter language="javascript" style={materialLight}>
      {codeString}
    </SyntaxHighlighter>
  );
};

export default CodeBoxComponent;
