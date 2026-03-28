import React from 'react'

const Title = ({ text1, text2, center = false }) => {
  return (
    <h1
      className={`font-semibold text-2xl md:text-3xl tracking-wide ${
        center ? 'text-center' : ''
      }`}
    >
      {text1}{' '}
      <span className='text-primary relative'>
        {text2}
        <span className='absolute left-0 -bottom-1 w-full h-[2px] bg-primary rounded'></span>
      </span>
    </h1>
  )
}

export default Title