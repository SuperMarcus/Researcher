import React from "react";
import {withStyles} from "material-ui/styles";
import PropTypes from "prop-types";
import { CircularProgress } from 'material-ui/Progress';
import Typography from 'material-ui/Typography';
import { ipcRenderer } from 'electron';
import Paper from 'material-ui/Paper';
import blue from 'material-ui/colors/blue';
import grey from 'material-ui/colors/grey';
import green from 'material-ui/colors/green';
import red from 'material-ui/colors/red';
import Button from 'material-ui/Button';

const styles = {
    root: {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column",
        height: "calc(100% - 32px)",
        marginTop: 16
    },
    questionContainer: {
        display: "flex",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column"
    },
    progressCircular: {
        margin: 32
    },
    questionHighlightContainer: {
        padding: 32,
        overflow: "scroll",
        background: grey[50],
        margin: "32px 64px",
        flexGrow: 99
    },
    questionTitle: {
        flexGrow: 1,
        marginTop: 32
    },
    questionSnippetRegular: {
        display: "inline",
        color: grey[400],
        paddingLeft: 8
    },
    questionSnippetHighlight: {
        display: "inline",
        color: grey[900]
    },
    actionsWrapper: {
        display: "flex",
        minHeight: 32,
        marginBottom: 16
    },
    actionsYesButton: {
        margin: 8,
        color: grey[100],
        backgroundColor: green[600],
        '&:hover': {
            backgroundColor: green[800],
        }
    },
    actionsNoButton: {
        margin: 8,
        color: grey[100],
        backgroundColor: red[600],
        '&:hover': {
            backgroundColor: red[800],
        }
    },
    completeRootWrapper: {
        display: "flex",
        height: "100%",
        justifyContent: "center",
        alignItems: "center",
        flexDirection: "column"
    },
    completeContainer: {
        margin: "32px 64px",
        overflow: "scroll",
        background: grey[50],
        padding: 32,
        flexGrow: 99
    },
    generatedOutputP: {
        color: grey[900],
        display: "inline"
    },
    generatedOutputTitle: {
        flexGrow: 1,
        marginTop: 32
    }
};

class Progress extends React.Component {
    state = {
        stage: "waiting",
        notice: "",
        status: "Asking Google...",

        //For question
        question: "",
        expectation: "string",
        snippets: [],
        highlights: [],

        //For progress
        progressTitle: "",
        progressCurrent: 0,
        progressTotal: 100,

        //For complete
        sentences: []
    };

    _listener = undefined;

    componentDidMount(){
        if(!!this._listener) ipcRenderer.removeListener("progress", this._listener);
        this._listener = (event, args) => {
            console.log(args);
            this.setState(args)
        };
        ipcRenderer.on("progress", this._listener);
    }

    componentWillUnmount(){
        if(!!this._listener){
            ipcRenderer.removeListener("progress", this._listener);
            this._listener = undefined;
        }
    }

    onSubmit(e){
        e.preventDefault();
    }

    onBooleanResponse(value){
        return () => (ipcRenderer.send("userResponse", value));
    }

    renderWait(classes){
        return (
            <div>
                <CircularProgress
                    className={classes.progressCircular}
                    size={80}
                    style={{ color: blue[200] }}/>
                <Typography
                    align="center"
                    variant="subheading">{this.state.status}</Typography>
            </div>
        );
    }

    renderQuestion(classes){
        //Since only booleans were used, but maybe others will later...
        const actions = (
            <div className={classes.actionsWrapper}>
                <Button
                    variant="raised"
                    onClick={this.onBooleanResponse(false)}
                    className={classes.actionsNoButton}>
                    NO
                </Button>
                <Button
                    variant="raised"
                    onClick={this.onBooleanResponse(true)}
                    className={classes.actionsYesButton}>
                    YES
                </Button>
            </div>
        );
        return (
            <div className={classes.questionContainer}>
                <Typography
                    align="center"
                    variant="subheading"
                    className={classes.questionTitle}>{this.state.question}</Typography>
                {this.state.snippets.length > 0 ? (
                    <Paper className={classes.questionHighlightContainer}>
                        {this.state.snippets.map((s, i) => (
                            <span key={i} className={this.state.highlights.includes(i) ?
                                classes.questionSnippetHighlight : classes.questionSnippetRegular}>
                                {s}
                            </span>
                        ))}
                    </Paper>
                ) : null}
                {actions}
            </div>
        );
    }

    renderProgress(classes){
        return (
            <div>
                <CircularProgress
                    className={classes.progressCircular}
                    size={80}
                    value={this.state.progressCurrent}
                    min={0}
                    variant="determinate"
                    max={this.state.progressTotal}
                    style={{ color: blue[200] }}/>
                <Typography
                    align="center"
                    variant="subheading">{this.state.progressTitle + "..."}</Typography>
                <Typography
                    align="center"
                    variant="body1">
                    {`${this.state.progressCurrent} out of ${this.state.progressTotal} completed`}
                </Typography>
            </div>
        );
    }

    renderComplete(classes){
        return (
            <div className={classes.completeRootWrapper}>
                <Typography
                    variant="headline"
                    className={classes.generatedOutputTitle}
                    align="center">Your Generated Responses!</Typography>
                <Paper className={classes.completeContainer}>
                    <p className={`${classes.generatedOutputP} select-region`}>{this.state.sentences.join(" ")}</p>
                </Paper>
                <Button onClick={() => {ipcRenderer.send("finish")}}>Home</Button>
            </div>
        );
    }

    renderByStage(classes){
        if (this.state.stage === "waiting") return this.renderWait(classes);
        else if(this.state.stage === "question") return this.renderQuestion(classes);
        else if(this.state.stage === "progress") return this.renderProgress(classes);
        else if(this.state.stage === "complete") return this.renderComplete(classes);
    }

    render(){
        const {classes} = this.props;
        return (
            <form onSubmit={this.onSubmit.bind(this)} className={classes.root}>
                {this.renderByStage(classes)}
            </form>
        );
    }
}

Progress.propTypes = {
    classes: PropTypes.object.isRequired,
};

export default withStyles(styles)(Progress);
