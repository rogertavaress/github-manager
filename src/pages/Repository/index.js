import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import api from '../../services/api';

import { Loading, Owner, IssueList, IssueTypesButtons } from './styles';
import Container from '../../components/Container/index';

export default class Repository extends Component {
    static propTypes = {
        match: PropTypes.shape({
            params: PropTypes.shape({
                repository: PropTypes.string,
            }),
        }).isRequired,
    };

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

    changeIssuesList = async value => {
        this.setState({
            loading: true,
        });

        const { repository } = this.state;

        const issues = await api.get(`/repos/${repository.full_name}/issues`, {
            params: {
                state: value,
                per_page: 5,
            },
        });

        this.setState({
            loading: false,
            issues: issues.data,
        });
    };

    render() {
        const { loading, repository, issues } = this.state;

        if (loading) {
            return <Loading>Carregando</Loading>;
        }

        return (
            <Container>
                <Owner>
                    <Link to="/">Voltar aos repositórios</Link>
                    <img
                        src={repository.owner.avatar_url}
                        alt={repository.owner.login}
                    />
                    <h1>{repository.name}</h1>
                    <p>{repository.description}</p>
                </Owner>
                <IssueTypesButtons>
                    <button
                        type="button"
                        onClick={() => this.changeIssuesList('all')}
                    >
                        Todas
                    </button>
                    <button
                        type="button"
                        onClick={() => this.changeIssuesList('open')}
                    >
                        Abertas
                    </button>
                    <button
                        type="button"
                        onClick={() => this.changeIssuesList('closed')}
                    >
                        Fechadas
                    </button>
                </IssueTypesButtons>
                <IssueList>
                    {issues.map(issue => (
                        <li key={String(issue.id)}>
                            <img
                                src={issue.user.avatar_url}
                                alt={issue.user.login}
                            />
                            <div>
                                <strong>
                                    <a href={issue.html_url}>{issue.title}</a>
                                    {issue.labels.map(label => (
                                        <span key={String(label.id)}>
                                            {label.name}
                                        </span>
                                    ))}
                                </strong>
                                <p>{issue.user.login}</p>
                            </div>
                        </li>
                    ))}
                </IssueList>
            </Container>
        );
    }
}
