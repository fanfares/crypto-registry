import { SystemService } from './open-api';
import { useState, useEffect } from 'react';

export const SystemStatus = () => {
  const [ status, setStatus ] = useState<string>('Loading...')

  useEffect( () => {
    SystemService.systemTest()
      .then(result => {
      setStatus(result.status);
    })
      .catch(err => {
        setStatus(err.message)
      })

  }, [status])

  return (
    <div>
      <p>Status: {status}</p>
    </div>
  )
}
