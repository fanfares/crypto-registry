import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from 'react-bootstrap';

const Sse = () => {

  const [time, setTime] = useState<string>('stopped');
  const eventSourceRef = useRef<EventSource | null>(null);

  useEffect(() => {
    return () => {
      if (eventSourceRef.current) {
        eventSourceRef.current.close();
      }
    };
  }, []);

  const startSource = useCallback(() => {
    if (!eventSourceRef.current) {

      const eventSource = new EventSource('/api/funding-submission/sse');
      eventSourceRef.current = eventSource;
      setTime('starting...')

      eventSource.onmessage = ({data}) => {
        const parsedData = JSON.parse(data);
        setTime(parsedData.time);
      };

      eventSource.onerror = () => {
        setTime('stopped');
        eventSource.close();
        eventSourceRef.current = null;
      };
    }
  }, []);

  const stopSource = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
      setTime('stopped')
    }
  }, []);

  const isRunning = !!eventSourceRef.current;

  return (
    <>
      <h3>Test Server Side Events</h3>
      <p>Time: {time}</p>
      {isRunning ?
        <Button style={{margin: 10}}
                onClick={stopSource}>
          Stop
        </Button>
        :
        <Button style={{margin: 10}}
                onClick={startSource}>
          Start
        </Button>
      }
    </>
  );
};

export default Sse;
