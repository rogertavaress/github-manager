import React, { Component } from 'react';

import { Container } from '../Main/styles';

import api from '../../services/api';

export default class Repository extends Component {
    state = {
        repository: {},
        issues: [],
        loading: true,
    };

    async componentDidMount() {
        const { match } = this.props;

        const repoName = decodeURIComponent(match.params.repository);

        const [repository, issues] = await Promise.all([
            await api.get(`/repos/${repoName}`),
            await api.get(`/repos/${repoName}/issues`, {
                params: {
                    state: 'open',
                    per_page: 5,
                },
            }),
        ]);

        this.setState({
            loading: false,
            repository: repository.data,
            issues: issues.data,
        });
    }

    render() {
        const { loading, repository, issues } = this.state;

        return (
            <Container>
                <h1>Repository:</h1>
            </Container>
        );
    }
}
