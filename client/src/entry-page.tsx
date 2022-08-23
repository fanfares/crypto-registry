import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useState } from 'react';

export const EntryPage = () => {

  const [userType, setUserType] = useState('')

  const handleChange = (e: any) => {
    e.persist();
    console.log(e.target.value);
    setUserType(e.target.value);
  }

  const handleSubmit = (e: any) => {
    e.preventDefault();
    alert(`${userType}`);
  };

  const type = 'radio';
  return (
    <Form onSubmit={handleSubmit}>
      <div key={`default-${type}`} className="mb-6">
        <Form.Check
          type="radio"
          value="custodian"
          onChange={handleChange}
          checked={userType==='custodian'}
          id={`default-${type}`}
          label="I want to register a new exchange"
        />

        <Form.Check
          type="radio"
          value="customer"
          checked={userType==='customer'}
          onChange={handleChange}
          label="I want to verify my Bitcoin balance at an exchange"
        />
      </div>
      <Button variant="primary" type="submit">
        Next
      </Button>
    </Form>

  );
  // return (
  //   <div>
  //     {/*<Button>*/}
  //     {/*  Custodian*/}
  //     {/*</Button>*/}
  //     {/*<Button>*/}
  //     {/*  Customer*/}
  //     {/*</Button>*/}
  //
  //     <p>
  //       <a>I want to submit a Custodian Record</a>
  //     </p>
  //     <p>
  //       <a>I want to verify my BitCoin balance at an exchange</a>
  //     </p>
  //   </div>
  // );
};
