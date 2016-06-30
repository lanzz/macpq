import React from 'react';
import { Pane } from 'react-photonkit';
import Sidebar from './sidebar.jsx';
import { remote } from 'electron';

const mainWindow = remote.require('./app/main');

class Database extends React.Component {
  componentDidMount() {
    this.client = this.props.client;
    this.refs.sidebar.refresh();
  }
  fetchAll(query, callback) {
    query.on('row', (row, result) => {
      result.addRow(row);
    });
    query.on('end', (result) => {
      callback(result);
    });
  }
  query(sql, params) {
    if (!this.client) {
      debugger;
    }
    const query = this.client.query(sql, params);
    query.on('error', (error) => {
      const message = `Error:\n${error.code}: ${error.message}`;
      mainWindow.showMessageBox({type: 'error', message: message});
    });
    return query;
  }
  render() { 
    return (
      <div>
        <Sidebar db={this} ref="sidebar" />
        <Pane>
        </Pane>
      </div>
    );
  }
}


export default Database;