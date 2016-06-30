import React from 'react';
import { Button, CheckBox, Input, Pane } from 'react-photonkit';
import { env } from 'process';
import pg from 'pg';
import { remote } from 'electron';

const mainWindow = remote.require('./app/main');


class Connect extends React.Component {
  constructor() {
    super();
    this.state = {
      disabled: false,
      database: 'essence_olive_3',
      host: '',
      port: '',
      ssl: false,
      username: '',
      password: ''
    };
  }
  handleChange(event) {
    var change = {};
    if (event.target.type == 'checkbox') {
      change[event.target.name] = event.target.checked;
    } else {
      change[event.target.name] = event.target.value;
    }
    this.setState(change);
  }
  connect(event) {
    event.preventDefault();
    if (!event.target.form.reportValidity()) {
      console.log('invalid form');
      return;
    }
    this.setState({disabled: true});
    const config = {
      user: this.state.user,
      database: this.state.database,
      password: this.state.password,
      port: this.state.port,
      host: this.state.host,
      ssl: this.state.ssl,
    };
    const client = new pg.Client(config);
    client.connect((error) => {
      this.setState({disabled: false});
      if (error) {
        const message = `Connection failed:\n${error.code}: ${error.message}`;
        mainWindow.showMessageBox({type: 'error', message: message});
      } else {
        this.props.onConnect(client);
      }
    });
  }
  render() {
    const connect = this.connect.bind(this);
    const handleChange = this.handleChange.bind(this);
    return (
      <Pane ptClass="pane-sm" className="padded-more">
        <form>
          <h4>Connect</h4>
          <Input name="database" value={this.state.database} onChange={handleChange} disabled={this.state.disabled} type="text" placeholder={env.USER} label="Database" />
          <Input name="host" value={this.state.host} onChange={handleChange} disabled={this.state.disabled} type="text" placeholder="localhost" label="Host" />
          <Input name="port" value={this.state.port} onChange={handleChange} disabled={this.state.disabled} type="number" placeholder="5432" label="Port" />
          <CheckBox name="ssl" checked={this.state.ssl} onChange={handleChange} disabled={this.state.disabled} label="Use SSL" />
          <Input name="username" value={this.state.username} onChange={handleChange} disabled={this.state.disabled} type="text" placeholder={env.USER} label="Username" />
          <Input name="password" value={this.state.password} onChange={handleChange} disabled={this.state.disabled} type="password" label="Password" />
          <div className="form-actions">
            <Button disabled={this.state.disabled} type="submit" ptStyle="primary" className="pull-right" text="Connect" onClick={connect} />
          </div>
        </form>
      </Pane>
    );
  }
}


export default Connect;
