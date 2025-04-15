
import React from 'react';
import { Link } from 'react-router-dom';
import "./PageNotFound.css"
const PageNotFound = () => {
  return (
    // <div style={{ textAlign: 'center', marginTop: '50px' }}>
    //   <h1>404 - Page Not Found</h1>
    //   <p>Sorry, the page you are looking for does not exist.</p>
    //   <Link to="/">Go back to the homepage</Link>
    // </div>
    <section class="page_404">
  <div class="container">
    <div class="row">
      <div class="col-sm-12 ">
        <div class="col-sm-10 col-sm-offset-1  text-center">
          <div class="four_zero_four_bg">
            <h1 class="text-center ">404</h1>

          </div>

          <div class="contant_box_404">
            <h6 class="h2">
              Look like you're lost
            </h6>

            <p>the page you are looking for not avaible!</p>

            <Link to="/" class="link_404">Go to Home</Link>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>
  );
};

export default PageNotFound;
