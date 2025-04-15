import React, { useEffect, useState } from 'react';

const BlockedAdmin = ({ htmlContent }) => {

    // console.log("INSIDEDDDDEEEE......", htmlContent);
    return (
        <div
            dangerouslySetInnerHTML={{ __html: htmlContent }}
        />
    );
};

export default BlockedAdmin;
