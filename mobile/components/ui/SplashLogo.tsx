import React from 'react';
import { Svg, Rect, Defs, Pattern, Use, Image } from 'react-native-svg';

const SplashLogo = ({ width = 40, height = 57 }) => {
  return (
    <Svg width={width} height={height} viewBox="0 0 40 57" fill="none">
      <Rect width={width} height={height * 1.4027} fill="url(#pattern0_481_5474)"/>
      <Defs>
        <Pattern id="pattern0_481_5474" patternContentUnits="objectBoundingBox" width="1" height="1">
          <Use xlinkHref="#image0_481_5474" transform="scale(0.00671141 0.00478469)"/>
        </Pattern>
        <Image id="image0_481_5474" width="149" height="209" preserveAspectRatio="none" xlinkHref="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJUAAADRCAYAAADFa/A1AAAACXBIWXMAAAsTAAALEwEAmpwYAAAAAXNSR0IArs4c6QAAAARnQU1BAACxjwv8YQUAAAptSURBVHgB7d39dds2GwXwqx7///qdoOwEjSewMkHjCSpPEGeCWBM0mcDuBG4mMDuB1QmMThBnAhaPCVgkLcr8AMmH4P2dg8qplBNZvMIXCXCFGlmWJfbhd1vWtryz5dQ9tXPlb1vS1WplQHSMDdOpLTdZc4/u9Rtb3oGoSELhQtLHoy13DNlyrfwPLgD32DdzoRjkzeU3ebTN5Q4UtedQuf6TBCrB8AwYsqj5UN3Yhw2m8WRLin3HnyGbuZWrpR6hB0M2cxKqL/bxI/RiyGZGQiV9qTXmQ0JW7JOlIFUkVN8RfsQ3JoZMGQlVhrgwZBOLMVRVPmS+T5aCBhVD89dFCoZsMBIqmU5IsGwpGLJgGKrDUpT7ZU+gxiRUD8gvbaF6KRiyxuY4T6VBCoasFkMVRoryCHPRIZNQ3SK/wpPCkYClWGjIGKpxLCpkDNU0iiHbxXad/xyuUlgCv5jEd/wNZuwE+WkMmtY7VzbyB/tFn3XITkAa1YVsFsvipPnb2Mcb0JwYlDv+BoowVHEwUBQyhipOBuXR5aiXYEuoPtjHO1DMDEZcFiehWiNf80fLYTBgyBgqEgbl0WWvkGlc90fT67UsjqGiJlqFjKGiLowtWxuu20NP+r0UYl9RQ8MwtlxUa66fQNRdYsuDrZNKV7mwpqJQznyN5WsqA6J+ZPfE5/WjbP4olMSWK/nBN39c+0chPNkm8P9s/igk2dl6zeaPQnvnQ8VLiimUUx+qHyAKhM0fBcdQUXAc/VFwrKkoOI7+KDgfqlFXW1DciqFibUVBPIfKbW3D2oqCKHbUtyAK4CVUbqvnryDqqTqlcA02g9RTKVSub/UeDBb18GryU4JlyxnYx6KOamfUbbCu7cMvtlwiX0hI1Miq6QvdRe1rV87Bu0TQYdvGoapyK5slWLIVkYQsAVGfUFW5kK1t+Q152BLQEoULVZUNmQRrjbwWk8el3VNwqYYLVZXbB0uCJjXZGhSr8UJV5UIm/bFfwZDFZLpQFXFkGRUdoariyHLWdIaqqjCylMKQ6TaPUFW5kWWx08+RpR7zDFUVR5aqxBGqKhcyKX6OjMYTZ6iK3Miy2OnnyHJY8YeqqjB94efIGLKwlheqKo4sg2Ooqjiy7I2hekvhxLi/+oIhO46haosjyzcxVH1wZHkQQxUSR5bPGKohLXRkyVCNaSGXXDNUU4p0ZMlQaRLJiXGGSrOZXnLNUM2F649tbJF76yXQa8uNZGditVoZtxWBbKDyJxQ7Ofakm3eR6jex5WfkWzj+a8vO7WdFI5Nw2YeNPTby+BkKHQyVa8vlDa/r/qJ9jd/S8RsYstFJreW+9B+hTKlP5d6khOkK7fmQ+dvMp6BBueP1AF19rH1H3b3Be4Q9tZCCIRuUPW4b+3ADPUqhukPefxpSCoYsOHvsvkPPxOnW3+52g2nSnsKFDHm/jHu5d2CP3y3yqQYNttruoZyi3PlnyBpQ1gRuT9wbSqDD2pXngYJ9bykYsiZUfS6rkfpSoaRgyF5xU0D3mFaKPNyfJFQyJJ3rxWQSsBT7zv8iQ6YgVFs32/9MQpUhHosM2cShKgVKxBaqqmLIdu4UR3QmDNWrQImVsjmOoe1Q7pMZRGCiUH2yn9+XQ0/IuT9pIpYSKr9QdCN/sAcjlpAlGNel/axu6548epXCAsQSsnOMQyogCdRfx160UjTxqZFBueNvoNBIx/D5Zlj2M9i99UIJlbTFa1ATBspCNtJsurHlokmgBEPVj8HEIRuhljLIayjT9C/4jjp1ky"/>
      </Defs>
    </Svg>
  );
};

export default SplashLogo;
