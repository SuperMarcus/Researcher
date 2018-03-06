import React from "react";
import {withStyles} from "material-ui/styles";
import PropTypes from "prop-types";
import Typography from "material-ui/Typography";
import TextField from "material-ui/TextField";
import Button from "material-ui/Button";
import Switch from 'material-ui/Switch';
import blue from 'material-ui/colors/blue';
import Tooltip from 'material-ui/Tooltip';
import {FormControlLabel} from "material-ui/Form";
import {ipcRenderer} from 'electron';

const styles = {
    root: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        height: "calc(100% - 32px)",
        marginTop: 16,
        animation: "fadein 0.5s"
    },
    titleWrapper: {
        alignSelf: "flex-start",
        width: "100%",
        margin: 0,
        flexGrow: 1,
    },
    title: {
        marginTop: 24,
        marginBottom: 0,
        padding: 0,
        color: "#e3e3e3",
        fontWeight: 100
    },
    subtitle: {
        marginTop: 0,
        marginBottom: 16,
        padding: 0,
        color: "#b3b3b3",
        fontWeight: 100
    },
    search: {
        width: "calc(100% - 200px)",
        marginTop: 32,
        marginBottom: 32
    },
    searchGenerateNum: {
        width: 184,
        marginLeft: 16
    },
    searchWrapper: {
        width: "80%",
        flexGrow: 10,
        margin: 0
    },
    actionGroupWrapper: {
        display: "flex",
        flexDirection: "row-reverse",
        alignSelf: "flex-end",
        margin: 0,
        flexGrow: 1,
    },
    actionSearch: {
        display: "block",
        marginLeft: 8,
        marginRight: 40,
        marginBottom: 32,
        height: "auto"
    },
    actionUseASPCheckerWrapper: {
        display: "block",
        marginLeft: "auto",
        marginBottom: 32,
        height: "auto",
        minWidth: 100
    },
    actionUseASPCheckerChecked: {
        color: blue[100],
        '& + $actionUseASPCheckerBar': {
            backgroundColor: blue[100],
        },
    },
    actionUseASPCheckerBar: {},
};

class Start extends React.Component {
    state = {
        useAsp: true,
        topic: "",
        num: "5",
        submitted: false,
        numErrorMessage: null,
        topicErrorMessage: null
    };

    sendSettings() {
        ipcRenderer.send("params", {
            asp: this.state.useAsp,
            topic: this.state.topic,
            num: parseInt(this.state.num)
        });
        this.setState({
            submitted: true
        });
    }

    onSubmit(e) {
        e.preventDefault();

        let error = 0;
        let errorStates = {};

        if (this.state.topic.length <= 0) {
            ++error;
            Object.assign(errorStates, {
                topicErrorMessage: "Enter a topic to research for"
            });
        } else {
            Object.assign(errorStates, {
                topicErrorMessage: null
            });
        }

        let v = parseInt(this.state.num);

        if (Number.isNaN(v)) {
            Object.assign(errorStates, {
                numErrorMessage: "Enter a valid number"
            });
            ++error;
        } else if (v > 2000) {
            Object.assign(errorStates, {
                numErrorMessage: "Too long (<= 2000)"
            });
            ++error;
        } else if (v < 1) {
            Object.assign(errorStates, {
                numErrorMessage: "Too short (>= 1)"
            });
            ++error;
        } else {
            Object.assign(errorStates, {
                numErrorMessage: null
            });
        }

        if (error === 0) {
            console.log("Send settings...");
            this.sendSettings();
        }

        this.setState(errorStates);
    }

    render() {
        const {classes} = this.props;
        return (
            <form onSubmit={this.onSubmit.bind(this)} className={classes.root}>
                <div className={classes.titleWrapper}>
                    <Typography
                        className={classes.title}
                        align="center"
                        variant="headline">Researcher</Typography>
                    <Typography
                        className={classes.subtitle}
                        align="center"
                        variant="body2">A simple program that makes life so much easier.</Typography>
                </div>

                <div className={classes.searchWrapper}>
                    <TextField
                        className={classes.search}
                        error={typeof this.state.topicErrorMessage === 'string'}
                        label="Search"
                        autoFocus={true}
                        placeholder={this.state.topicErrorMessage || "Help me with my research!"}
                        disabled={this.state.submitted}
                        onChange={(e) => (this.setState({
                            topic: e.target.value
                        }))}
                        helperText="What do you want to search for?"/>
                    <TextField
                        error={typeof this.state.numErrorMessage === 'string'}
                        label="Number of Sentences"
                        value={this.state.num}
                        disabled={this.state.submitted}
                        onChange={(e) => (this.setState({
                            num: e.target.value
                        }))}
                        helperText={this.state.numErrorMessage}
                        type="number"
                        className={classes.searchGenerateNum}
                        margin="normal"
                    />
                </div>

                <div className={classes.actionGroupWrapper}>
                    <Button
                        variant="raised"
                        color="primary"
                        disabled={this.state.submitted}
                        type="submit"
                        className={classes.actionSearch}>
                        {this.state.submitted ? "Processing..." : "Search & Summary"}
                    </Button>
                    <div className={classes.actionUseASPCheckerWrapper}>
                        <Tooltip
                            title="Automatically replace words with its synonyms"
                            placement="bottom">
                            <FormControlLabel
                                control={
                                    <Switch
                                        checked={this.state.useAsp}
                                        disabled={this.state.submitted}
                                        onChange={(n, useAsp) => this.setState({useAsp})}
                                        classes={{
                                            checked: classes.actionUseASPCheckerChecked,
                                            bar: classes.actionUseASPCheckerBar
                                        }}
                                        value="useAsp"
                                    />
                                }
                                label="Use ASR"
                            />
                        </Tooltip>
                    </div>
                </div>
            </form>
        );
    }
}

Start.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Start);
