import React from 'react';
import {Link} from 'react-router-dom';

export const UserName = ({row, style = {}}) => {
  return (
    <Link
      to={`/user/profile/${row.user_id ? row.user_id : row.id}`}
      style={{
        color: 'rgba(0,0,0,0.87)',
        textDecoration: 'none',
        ...style
      }}
    >
      <h5 className="mb-0 font-weight-bold">{row.name}</h5>
      <h6 className="mb-0">{row.username}</h6>
    </Link>
  )
}