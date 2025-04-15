import React from 'react';
// import "./SiteMonitor.css";


const  Stock = () => {
  return (
    <div className=' MinningHome mx-5'>
        <div className="">
        <div className="headingingOfAgri Text-Center">
          <div className='HeadingForMinning p-0'><p className='titleOfdefemce' >Minning</p></div>
          <div className="headingingOfAgri">
          <img src="MinningBannerImage.jpg" alt=""className='BannerOfDefence'></img>
          </div>
          <div className="mx-5 mt-4">
            <p className=" ParaForAgri">Mining with satellite images refers to the 
            utilization of remote sensing technology and satellite data to observe, analyze, 
            and manage mining activities.
Mining using satellite images is an innovative and efficient approach that <br></br>leverages
 remote sensing technology to monitor and manage various aspects of mining operations <br></br>
 <br></br>
<div className='text-left mt-3'> <ol class="">Importance of Satellite Imaging in Mining

    <li className='ParaForAgri'>Remote Monitoring: Satellite images offer a comprehensive 
    and remote view of mining sites.</li>
    <li className='ParaForAgri'>Data Accuracy: High-resolution imagery enhances the accuracy of data for decision-making.
</li>
    <li className='ParaForAgri'>Environmental Compliance: Monitoring environmental impact and ensuring compliance with regulations.
</li>
  </ol></div>


               </p>
              
          </div>

          <div>
               
              
                <div class="row mx-auto">
                
    {/* <div class="col-md-4 col-sm-6 items mx-auto">
      <div class="cardD items-cards card-block">
      
      <p className='text-center HeadingOfMinningCard'>Site Monitoring

</p>
    <img className='Dimg' src="minning1.jpg" alt="Photo of sunset"/>
        <div> 
        <p class="cardsTextsOfMinning">Satellite images allow for regular monitoring of mining sites,
         providing a comprehensive view of the entire area. This helps track changes in topography, 
         land use, and infrastructure development over time.

 .</p> </div> 
  </div>
    </div> */}
    {/* <div class="col-md-4 col-sm-6 items mx-auto">
      <div class="cardD items-cards card-block">
      <p className='text-center HeadingOfMinningCard'>Illegal Mining Detection


</p>
     
    <img  className='Dimg' src="minning2.jpg" alt="Photo of sunset"/>
       <div> 
        <p class="cardsTextsOfMinning">Satellite imagery is instrumental in detecting 
        unauthorized or illegal mining activities. It enables authorities to identify 
        and address areas where mining is occurring without proper permits or compliance with regulations.

</p> </div>
  </div>
    </div> */}
    <div class="col-md-4 col-sm-6 items mx-auto">
      <div class="cardD items-cards card-block">
      <p className='text-center HeadingOfMinningCard'>Stockpile Monitoring


</p>
    <img  className='Dimg' src="minning3.jpg" alt="Photo of sunset"/>
        
        <p class="cardsTextsOfMinning">Satellite technology facilitates the monitoring of ore stockpiles,
         helping mining companies manage inventory and plan extraction operations more efficiently.

</p> 
  </div>
    </div>
  
  </div>
  
               </div>
         
          
        </div>
      </div>  
    </div>
  )
}

export default Stock;