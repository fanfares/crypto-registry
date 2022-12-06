import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export const EntryPage = () => {

  const [userType, setUserType] = useState('');
  const navigate = useNavigate();

  const handleChange = (e: any) => {
    e.persist();
    setUserType(e.target.value);
  };

  const handleSubmit = (e: any) => {
    e.preventDefault();
    navigate(userType);
  };

  const type = 'radio';
  return (
    <Form onSubmit={handleSubmit}>
      <div key={`default-${type}`} className="mb-6">
        <Form.Check
          type="radio"
          value="exchange"
          onChange={handleChange}
          checked={userType === 'exchange'}
          id={`default-${type}`}
          label="I want to register an exchange on the Crypto Registry" />

        <Form.Check
          type="radio"
          value="customer"
          checked={userType === 'customer'}
          onChange={handleChange}
          label="I want to verify my Bitcoin balance at an exchange" />
      </div>
      <Button variant="primary"
              type="submit">
        Next
      </Button>
    </Form>

  );
};
