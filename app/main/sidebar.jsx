import React from 'react';
import { NavGroup, NavGroupItem, NavTitle, Pane } from 'react-photonkit';


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
        <NavGroup>
          {relations}
        </NavGroup>
      </Pane>
    );
  }
}


export default Sidebar;