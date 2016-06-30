import React from 'react';
import { Content } from 'react-photonkit';
import Connect from './connect.jsx';
import Database from './database.jsx';


class MainWindow extends React.Component {
  constructor() {
    super();
    this.state = {
      client: undefined
    };
  }
  onConnect(client) {
    this.setState({client: client});
    client.on('end', this.onDisconnect.bind(this));
  }
  onDisconnect(error) {
    this.setState({client: undefined});
    if (error) {
      const message = `Disconnected:\n${error.code}: ${error.message}`;
      mainWindow.showMessageBox({type: 'error', message: message});
    }
  }
  render() {
    if (this.state.client) {
      return (
        <Content>
          <Database client={this.state.client} />
        </Content>
      );
    } else {
      const onConnect = this.onConnect.bind(this);
      return (
        <Content>
          <Connect onConnect={onConnect}/>
        </Content>
      );
    }
  }
}


export default MainWindow;