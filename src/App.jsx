// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

import Map, { NavigationControl } from "react-map-gl/maplibre";
import { withIdentityPoolId } from "@aws/amazon-location-utilities-auth-helper";
import { LocationClient, BatchGetDevicePositionCommand } from "@aws-sdk/client-location"; // ES Modules import
import { withAPIKey } from "@aws/amazon-location-utilities-auth-helper";

import "maplibre-gl/dist/maplibre-gl.css";

// Amazon Hub Lockers in Vancouver as a GeoJSON FeatureCollection
import lockerGeoJSON from "./lockers.json";

// React Component that renders markers for all provided lockers
import LockerMarkers from "./LockerMarkers";

const identityPoolId = import.meta.env.VITE_IDENTITY_POOL_ID;
const region = import.meta.env.VITE_REGION;
const mapName = import.meta.env.VITE_MAP_NAME;

const authHelper = await withIdentityPoolId(identityPoolId);


// trackerからJSON形式で受け取る
const identityPoolIdLocation = "ap-northeast-1:4d0edb3c-67a8-4f03-be8d-19d897cf24f4";
const authHelperLocation = await withIdentityPoolId(identityPoolIdLocation);
const client = new LocationClient({
	region: "ap-northeast-1",
	...authHelperLocation.getLocationClientConfig(),
});
const input = {
  TrackerName: "GPSMultiUnitHandson",
  DeviceIds: [
    "gpsmultiunit",
  ],
};
const command = new BatchGetDevicePositionCommand(input);
const response = await client.send(command);
console.log(response);
console.log(response.DevicePositions);
console.log(response.DevicePositions[0].Position[0]);



// transform GeoJSON features into simplified locker objects
//const lockers = lockerGeoJSON.features.map(
//  ({
//    geometry: {
//      coordinates: [longitude, latitude],
//    },
//    properties: { title, address: description },
//  }) => ({
//    latitude,
//    longitude,
//    title,
//    description,
//  })
//);

const lockers = [{
latitude: response.DevicePositions[0].Position[1],
longitude:response.DevicePositions[0].Position[0],
title:"title",
description:"description",
}];

export default () => (
  <Map
    // See https://visgl.github.io/react-map-gl/docs/api-reference/map
    // 駅前不動産スタジアムの緯度経度
    initialViewState={{
      latitude: response.DevicePositions[0].Position[1],
      longitude: response.DevicePositions[0].Position[0],
      zoom: 15,
    }}
    style={{ height: "100vh", width: "100vw" }}
    mapStyle={`https://maps.geo.${region}.amazonaws.com/maps/v0/maps/${mapName}/style-descriptor`}
    {...authHelper.getMapAuthenticationOptions()}
  >
    {/* See https://visgl.github.io/react-map-gl/docs/api-reference/navigation-control */}
    <NavigationControl position="bottom-right" showZoom showCompass={false} />

    {/* Render markers for all lockers, with a popup for the selected locker */}
    <LockerMarkers lockers={lockers} />
  </Map>
);
