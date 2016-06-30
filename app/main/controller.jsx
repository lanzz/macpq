import React from 'react';
import ReactDom from 'react-dom';
import { Window } from 'react-photonkit';
import MainWindow from './mainwindow.jsx';

require('../../index.scss');

ReactDom.render(
  <Window>
    <MainWindow />
  </Window>
  , document.querySelector("#main"));
