import React from 'react';
import ReactDom from 'react-dom';
import { Window, Content, Pane, Input, CheckBox, Button, NavGroup, NavGroupItem, NavTitle } from 'react-photonkit';
import { remote } from 'electron';
const env = require('process').env;
const pg = require('pg');

require('../../index.scss');


const mainWindow = remote.require('./app/main');


class Connect extends React.Component {
  constructor() {
    super();
    this.state = {
      disabled: false,
      database: '',
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


class Sidebar extends React.Component {
  constructor() {
    super();
    this.state = {
      current: undefined,
      databases: [],
      schemas: [],
    };
  }
  componentDidMount() {
    this.db = this.props.db;
  }
  refresh() {
    var query;

    this.setState({current: this.db.client.database});

    query = 'SELECT datname AS name FROM pg_catalog.pg_database ORDER BY 1';
    this.db.fetchAll(
      this.db.query(query),
      (result) => {
        this.setState({databases: result.rows.map((row) => row.name)});
      }
    );

    query = 'SELECT n.nspname AS schema, c.relname AS relation ' +
            'FROM pg_catalog.pg_class AS c LEFT JOIN pg_catalog.pg_namespace AS n ' +
            '  ON n.oid = c.relnamespace ' +
            'WHERE c.relkind IN (\'r\', \'v\', \'m\', \'f\') ' +
            '  AND n.nspname !~ \'^pg_\' ' +
            '  AND n.nspname != \'information_schema\' ' +
            'ORDER BY 1, 2';
    this.db.fetchAll(
      this.db.query(query),
      (result) => {
        var schemas = {};
        result.rows.forEach((row) => {
          if (!(row.schema in schemas)) {
            schemas[row.schema] = [];
          }
          schemas[row.schema].push(row.relation);
        });
        this.setState({schemas: schemas});
      }
    );
  }
  render() {
    var databases = [<NavTitle key="">Databases</NavTitle>];
    this.state.databases.forEach((db) => {
      databases.push(
        <NavGroupItem key={db} eventKey={db} glyph="database" text={db} />
      );
    });
    var schemas = Object.keys(this.state.schemas);
    schemas.sort();
    var relations = [];
    schemas.forEach((schema) => {
      relations.push(<NavTitle key={schema} glyph="folder">{schema}</NavTitle>);
      this.state.schemas[schema].forEach((rel) => {
        const key = schema + '.' + rel;
        relations.push(<NavGroupItem key={key} eventKey={key} glyph="doc-text-inv" text={rel}/>);
      });
    })
    return (
      <Pane ptSize="sm" sidebar>
        <NavGroup activeKey={this.state.current}>
          {databases}
        </NavGroup>
        {this.state.current}
        <NavGroup>
          {relations}
        </NavGroup>
      </Pane>
    );
  }
}


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
      <Content>
        <Sidebar db={this} ref="sidebar" />
        <Pane>
        </Pane>
      </Content>
    );
  }
}


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


ReactDom.render(
  <Window>
    <MainWindow />
  </Window>
  , document.querySelector("#main"));
