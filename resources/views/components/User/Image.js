import React from 'react';
import {Link} from 'react-router-dom';
import {URL} from '../../config';

export const UserImage = ({row}) => {
  return (
    <Link
      to={`/user/profile/${row.user_id ? row.user_id : row.id}`}
      style={{
        width: 80,
        height: 80,
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}
    >
      <div
        style={{
          width: 60,
          height: 60,
          borderRadius: 40,
          overflow: 'hidden'
        }}
      >
        <img
          src={`${URL.STORAGE_URL}/${row.url}`}
          style={{
            width: '100%',
            height: '100%',
            objectFit: 'cover',
            overflow: 'hidden'
          }}
        />
      </div>
    </Link>
  )
}