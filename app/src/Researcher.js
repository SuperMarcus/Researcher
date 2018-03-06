import React from "react";
import MuiThemeProvider from "material-ui/styles/MuiThemeProvider";
import PropTypes from 'prop-types';
import Button from 'material-ui/Button';
import Typography from 'material-ui/Typography';
import { createMuiTheme, withStyles } from 'material-ui/styles';
import { ipcRenderer } from 'electron';

import Start from './Start';
import Progress from './Progress';

const theme = createMuiTheme({
    palette: {
        type: 'dark',
    },
});

const styles = {

};

class Researcher extends React.Component {
    state = {
        displaying: undefined
    };

    _listener = undefined;
    _views = new Map([
        [ "start", Start ],
        [ "progress", Progress ]
    ]);

    componentWillMount(){
        this.state.displaying = this._views.get("start");
    }

    componentDidMount(){
        if(!!this._listener) ipcRenderer.removeListener("display", this._listener);
        this._listener = this.onDisplayOptions.bind(this);
        ipcRenderer.on("display", this._listener);
    }

    componentWillUnmount(){
        if(!!this._listener){
            ipcRenderer.removeListener("display", this._listener);
            this._listener = undefined;
        }
    }

    onDisplayOptions(event, args){
        let displaying = this._views.get(args);
        this.setState({ displaying });
    }

    render(){
        const { classes } = this.props;
        let View = this.state.displaying;
        return (
            <MuiThemeProvider theme={theme}>
                <View />
            </MuiThemeProvider>
        );
    }
}

Researcher.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Researcher);
