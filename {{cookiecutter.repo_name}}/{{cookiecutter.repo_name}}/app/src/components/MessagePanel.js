import React from 'react';


class MessagePanel extends React.Component {
    render() {
        const title = this.props.title && <h1>{this.props.title}</h1>;
        const description = this.props.description && <p className="text-muted">{this.props.description}</p>;
        return (
            <div className="panel-message-wrapper">
                <div className="login-background"></div>
                <div className="panel panel-shadow panel-message">
                    {title}
                    {description}
                    {this.props.children}
                </div>
            </div>
        );
    }
}

export default MessagePanel;
