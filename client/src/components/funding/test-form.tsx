import React from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Form, Button, Container } from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';

interface IFormInput {
  agreeTerms: boolean;
}

const MyForm: React.FC = () => {
  const { control, handleSubmit } = useForm<IFormInput>();
  const onSubmit = (data: IFormInput) => console.log(data);

  // Watch the value of the checkbox
  // const checkboxValue = watch("agreeTerms");

  return (
    <Container className="mt-4">
      <Form onSubmit={handleSubmit(onSubmit)}>
        <Form.Group>
          <Controller
            name="agreeTerms"
            control={control}
            defaultValue={false}
            render={({ field: { value, ...field } }) => (
              <Form.Check
                type="checkbox"
                label="I agree to the terms and conditions"
                {...field} // value is omitted here
              />
            )}
          />
        </Form.Group>
        {/*{checkboxValue && <p>You have agreed to the terms and conditions.</p>}*/}
        <Button type="submit">Submit</Button>
      </Form>
    </Container>
  );
}

export default MyForm;
