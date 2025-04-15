// UnderConstruction.js
import React, { useState, useEffect } from "react";
import "./WaterHome.css";

const WaterHome = () => {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading for a few seconds (you can adjust the timing)
    const timer = setTimeout(() => {
      setLoading(false);
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  return (
    <div className='WaterHome mx-5'>
    <div className="AgriCulTop">
   <div className=" Text-Center">
     <div className='HeadingForWater p-0'><p className='titleOfWater px-4'>Water Management
</p></div>
     <div className="headingingOfAgri">
     <img src="waterBannerImg.jpg" alt=""className='BannerOfDefence'></img>
     </div>
     <div className="mx-5 mt-4">
       <p className=" ParaForAgri">Satellite images are crucial for water management,
        enabling precise mapping of water bodies and monitoring water quality.
         They help identify potential contamination sources, detect changes 
         in vegetation and soil moisture for early drought warnings,
          and optimize irrigation practices. Additionally, 
          satellite data aids in flood prediction and emergency response. 
          This technology supports both immediate concerns and long-term planning,
           ensuring sustainable and efficient water resource utilization


          </p>
         
     </div>

     <div>
           
           <div class="row mx-auto my-5">
           
<div class="col-md-4 col-sm-6 items mx-auto">
 <div class="cardD items-cards card-block">
 {/* <h4 class="cardD-title text-right"><i class="material-icons">settings</i></h4> */}
 <p className='text-center HeadingOfCardWater'>NDWI

</p>
<img className='Dimg' src="water1.jpg" alt="Photo of sunset"/>
   <div> 
   <p class="CardTextsWater">NDWI (Normalized Difference Water Index) is a remote 
   sensing method that uses satellite imagery to detect and delineate water bodies 
   by measuring the difference in reflectance between near-infrared and green wavelengths.
    It's a useful tool for mapping and monitoring water features in various 
    environmental applications such as hydrological studies, drought monitoring, 
    and land cover classification.

.</p> </div> 
</div>
</div>
<div class="col-md-4 col-sm-6 items mx-auto">
 <div class="cardD items-cards card-block">
 <p className='text-center  HeadingOfCardWater'>Drought Monitoring


</p>
<img  className='Dimg' src="water2.jpg" alt="water2.jpg"/>
  <div> 
   <p class="CardTextsWater">Satellite imagery aids in the detection of drought
    conditions by assessing changes in vegetation health and soil moisture content.
     This information assists in early drought warning systems and the implementation of 
   appropriate water conservation measures
</p> </div>
</div>
</div>
<div class="col-md-4 col-sm-6 items mx-auto">
 <div class="cardD items-cards card-block">
 <p className='text-center  HeadingOfCardWater'>Irrigation Management


</p>
<img  className='Dimg' src="water3.jpg" alt="water3.jpg"/>
   
   <p class="CardTextsWater">Satellite images help optimize irrigation practices 
   by providing insights into crop water requirements. Monitoring soil moisture 
   levels and crop health allows for precision agriculture, reducing water wastage 
   and enhancing agricultural productivity.

</p> 
</div>
</div>

</div>

<div class="row mx-auto my-5">
           
           <div class="col-md-4 col-sm-6 items mx-auto">
             <div class="cardD items-cards card-block">
             <p className='text-center  HeadingOfCardWater'>Quantification of Water Bodies


       </p>
           <img className='Dimg' src="water4.jpg" alt="water4.jpg"/>
               <div> 
               <p class="CardTextsWater">Through spectral analysis, satellite data 
               allows for the estimation of water extent and volume. This quantitative 
               data is essential for assessing water availability, tracking changes over
                time, and managing water allocation.

        .</p> </div> 
         </div>
           </div>
           <div class="col-md-4 col-sm-6 items mx-auto">
             <div class="cardD items-cards card-block">
             <p className='text-center  HeadingOfCardWater'>Flood Prediction and Management


       
       </p>
             {/* <h4 class="itemD-card-title text-right"><i class="material-icons">settings</i></h4> */}
           <img  className='Dimg' src="water5.jpg" alt="water5.jpg"/>
              <div> 
               <p class="CardTextsWater">By regularly capturing and analyzing 
               satellite data, it becomes possible to monitor and predict 
               potential flood events. This early warning system supports 
               emergency preparedness and response efforts.


       </p> </div>
         </div>
           </div>
           <div class="col-md-4 col-sm-6 items mx-auto">
             <div class="cardD items-cards card-block">
             <p className='text-center  HeadingOfCardWater'>Ecosystem Health Assessment


       
       </p>
           <img  className='Dimg' src="water6.jpg" alt="water6.jpg"/>
             
               <p class="CardTextsWater">Monitoring changes in water bodies 
               through satellite imagery aids in assessing the overall 
               health of ecosystems. 
               This information is valuable for
                conservation efforts and biodiversity management.

       </p> 
         </div>
           </div>
          
         </div>
          
          </div>
    
     
   </div>
 </div>
   
</div>
  
  );
};

export default WaterHome;
