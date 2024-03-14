import { Col, Row } from 'antd';

export interface InfoRowElement {
  title: string;
  value: string;
  span?: number;
}

export interface InfoRowProps {
  data: InfoRowElement[];
}

const InfoRow = ({data}: InfoRowProps) => {

  return (
    <>
      <Row gutter={[16, 16]}>
        {data.map(element =>
          <Col span={element.span ?? 3}><span style={{color: 'grey'}}>{element.title}</span></Col>
        )}
      </Row>

      <Row gutter={[16, 16]} style={{marginBottom: 20}}>
        {data.map(element =>
          <Col span={element.span ?? 3}>{element.value}</Col>
        )}
      </Row>
    </>
  );
};

export default InfoRow;
