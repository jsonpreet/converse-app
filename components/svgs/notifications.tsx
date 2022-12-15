import React from "react";
import { SvgXml } from "react-native-svg";

export default function NotificationsSVG() {
  const svg = `<svg width="57" height="53" viewBox="0 0 57 53" fill="none" xmlns="http://www.w3.org/2000/svg">
  <path d="M12.1372 52.0649C15.4648 52.0649 22.0972 49.0356 27.2607 45.3408C43.8071 45.3867 56.0391 35.771 56.0391 23.103C56.0391 21.1753 55.7178 19.3164 55.144 17.5493C53.4917 18.8115 51.4263 19.5459 49.3608 19.5229C49.7739 20.6704 50.0034 21.8638 50.0034 23.103C50.0034 32.0532 40.4565 39.3511 28.5 39.3511C28.1328 39.3511 27.6279 39.3511 27.0083 39.3281C25.9985 39.3281 25.2642 39.5806 24.2773 40.3838C21.6152 42.4263 17.4385 45.1343 15.4648 45.9375C15.0288 46.0981 14.8452 45.9146 15.1665 45.5244C16.1533 44.2852 17.7598 42.1968 18.7007 40.4526C19.481 39.0298 19.0908 37.8364 17.5991 37.125C10.9438 33.958 6.99658 28.8862 6.99658 23.103C6.99658 14.1299 16.5435 6.83203 28.5 6.83203C31.667 6.83203 34.6274 7.38281 37.2896 8.34668C37.1289 6.2583 37.6338 4.19287 38.7812 2.42578C35.6143 1.37012 32.126 0.819336 28.5 0.819336C13.2158 0.819336 0.960938 10.7563 0.960938 23.103C0.960938 30.6304 5.45898 37.4692 12.5273 41.21C11.6323 42.8394 10.1406 45.1802 9.19971 46.4424C7.34082 48.9209 8.80957 52.0649 12.1372 52.0649ZM48.1675 16.5396C52.459 16.5396 56.0391 12.9824 56.0391 8.69092C56.0391 4.37646 52.459 0.819336 48.1675 0.819336C43.853 0.819336 40.2959 4.37646 40.2959 8.69092C40.2959 12.9824 43.853 16.5396 48.1675 16.5396Z" fill="#007AFF"/>
  </svg>
  `;
  return <SvgXml xml={svg} />;
}
