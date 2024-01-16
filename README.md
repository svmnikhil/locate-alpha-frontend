# Technical Documentation for the Take Home Demo Project

## Problem Statement:

Build a fullstack application that renders regional polygons on a map and calculates the \
average income and total population that are highlighted using an adjustable circle.


## Table of Contents:

In this file, I will be going over: \
- the architecture I created
- issues I faced and how I overcame these issues \
- high level explanation of the algorithm \
- features to add and improvements to make \

## Architecture

### DevOps

An AWS environment was made to serve this application. \

Tools I used to serve frontend and backend:
- Elastic Beanstalk with application load balancer to serve spring boot jar
- S3 bucket to serve Reactjs 

CI/CD tools I used for automated deployments:
- AWS Codepipeline for both frontend and backend that are triggered on github actions
    - I configured a buildspec file that would be used in the build stage 
    - I also configured a deployment stage that fetches the build artifacts that I created to deploy the app

I should have sent you a temporary IAM access key to view these devOps features in my email.

### Backend

Created backend using Spring Boot. 
I leveraged third party libraries "ugeojson" to convert geometry data in my MVC pattern, \
you may see odd folders in the root folder in the backend. These had to be imported since they \
were not contained in a central maven repository.

### Frontend

Created frontend using Reactjs and rendered map using Mapbox.
Leveraged third party packages here as well. Namely, Turf.js that does client side processing of \
polygon, point, and other feature data types. I also created .env.development and .env.production \
to handle CORS and API key security automatically. 

## Issues I faced

### Viewing postgres data

Firstly, there were issues viewing data, the gis database kept returning empty values in the dfw_demo table. \
I tried using SSMS, Azure Data Studio, a plugin inside Intellij, spinning up my own tomcat \
server and installing mysql instance to it. There was also no clean way to view the geometry data \
since the ST_asGeoJSON function was not functioning in any SQL query I was familiar with. 

Eventually I connected using terminal/command prompt.
Although I still could not view geometry data, I kept marching on.


### PostGIS in backend

Although the PostGIS extension existed in the database, I was not able to use its functions to select geometry data \
via Spring JPA @query annotations in my NeighbourhoodRepository file. 
For some reason, when using the MVC pattern, I have not found a reliable way to convert geometry data to geoJSON data using \
PostGIS in transit. To fix this I had to import ultimate-geojson projects that convert Geometry data of all kinds to geoJSON data \
I created my own serializer that converts in transit geometry data and converts it to geoJSON data. This was sent to the frontend.

### CentroidsInCircle function in Turf.js

PointsWithinPolygon was a very finnicky method of the Turf.js package. To overcome this, I had to create my own pointsWithinPolygon \ 
that searched for point features inside a polygon feature. To do this, I calculated the distance between all the centroid points and \
the center of the object. Compared the distance of all the points to the center and the radius of the circle. 


## The Algo

The algorithm works in this 3 step process: 
- initially fetches data and renders the data on the map
- figures out when centroids are within the circle 
- does a reverse lookup of centroidsInTheCircle and the original dataset to grab census data \
    population and income to calculate sum and avg respecitvely.

## Features and Improvements

### Calculate using the areal proportion method

The overall algorithm I imagine would go something like this:
- render polygons and circle as usual
- calculate polygon-to-polygon intersection and not point-to-polygon intersections like before
- draw new polygons that cut regional polygons and follow the shape of the arc on the circle.
- construct an array of these polygons and contain an id for each that can be used to do a reverse-lookup
- calculate the area of each of these polygons and calculate it as a percentage of the area of the whole polygon
- store the average income and total population of these percentage polygons
- calculate the area of the total circle and find the proportion of each polygon within it as a percentage.
- calculate the average income using this proportion and the known income from the percentage polygon data.
- return total population as a summation and average income.

### Cloudwatch alarms and code artifactory

Setting up cloudwatch alarms for the entire environment would be the next step I would do. Also configure code artifactory with webhooks to manage third party libraries.

### UI features and improvements

- A history button to persist previously calculated data. 
- Adjust the color of the map and the circle to be more visible and feel more functional
- Introduce tooltips to polygons on the map
- Settings to toggle certain map features (i.e. toggle centroids, toggle polygon fill color, toggle circle, etc.)
