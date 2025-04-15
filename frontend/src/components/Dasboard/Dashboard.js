import React from 'react';
import './Dashboard.css';
import CopyRightFooter from "../CopyRightFooter/CopyRightFooter";
import DashboardIMg3 from '../../asset/DashBord_IMages/DashBord_image3.png'
import DashboardIMg4 from '../../asset/DashBord_IMages/DashBord_image4.png'


const Dashboard = () => {
  return (
    <>
      <div className="mainBodyOfappication">
        <div className="row justify-content-center DashBordFirstImage">
          <div className="col-md-10 text-center DashBordFirstImageMainBox">
            <button className="display-4 fw-bold">GEOPICX DASHBOARD UNDER CONSTRUCTION</button>
            <p className="lead responsivemainContaiofdashboard">
              <b>Welcome to the Geopicx Dashboard,</b> your one-stop platform for accessing and managing high-resolution satellite imagery. Whether you're analyzing agricultural fields, monitoring water resources, overseeing mining operations, or ensuring national security, our dashboard provides you with real-time data, insights, and tools to make informed decisions. Explore our vast collection of satellite imagery products, customized for various applications, and unlock the power of geospatial intelligence.
            </p>
          </div>
        </div>
        <div className="d-flex mt-5 justify-content-center align-items-center DashBordImage2">
          <div className="text-justify 'pl-sm-5 d-flex flex-column flex-md-row mt-5 justify-content-around align-items-center DashBordImage2MainBox">
            <div className='mobileView'>
              <h2 className="text-left">Products</h2>
              <ul className="text-justify ">
                <li><b>High-Resolution Satellite Images:</b> Clear, detailed images for precise analysis.</li>
                <li><b>Multi-Spectral Imagery:</b> Visualize land, vegetation, and water in multiple spectral bands.</li>
                <li><b>Time-Series Imagery:</b> Track changes over time with regularly captured images.</li>
                <li><b>Custom Area Imagery:</b> Order images for specific areas with flexible coverage.</li>
                <li><b>3D Terrain Models:</b> Get 3D landscape visualizations for spatial analysis.</li>
                <li><b>Real-Time Satellite Data:</b> Access near real-time data for quick decisions.</li>
              </ul>
            </div>
            <div className="mb-2">
              <img src={DashboardIMg3} alt="DashboardIMg3" className="img-fluid" />
            </div>
          </div>
        </div>

        <div className="d-flex mt-5 mb-5 justify-content-center align-items-center DashBordImage2">
          <div className="text-justify 'pl-sm-5 d-flex flex-column flex-md-row mt-5 justify-content-around align-items-center DashBordImage2MainBox">
            <div className='mobileView'>
              <h2 className="text-left">Application</h2>
              <ul className="text-justify ">
                <li><b>Agriculture:</b> Monitor crop health, soil moisture, and support precision farming with accurate data.</li>
                <li><b>Water Resources:</b> Track water levels, analyze bodies of water, and manage flood risks.</li>
                <li><b>Mining:</b> Identify mineral zones, monitor mining activities, and assess environmental impact.</li>
                <li><b>Defence & Security:</b> Use imagery for border surveillance, troop tracking, and ensuring national security.</li>
                <li><b>Urban Planning:</b> Plan infrastructure, monitor land use, and manage urban expansion effectively.</li>
                <li><b>Disaster Management:</b> Get real-time updates on floods, earthquakes, and more for emergency response.</li>
              </ul>
            </div>
            <div className="mb-4">
              <img src={DashboardIMg4} alt="DashboardIMg4" className="img-fluid" height={345} />
            </div>
          </div>
        </div>

        <div className="ml-0"><CopyRightFooter />
        </div>
      </div>
    </>
  );
};

export default Dashboard;
