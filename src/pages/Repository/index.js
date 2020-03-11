import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';

import api from '../../services/api';

import {
    Loading,
    Owner,
    IssueList,
    IssueTypesButtons,
    PaginationButtons,
} from './styles';
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
        issuesPage: 1,
        issuesStatus: 'open',
    };

    async componentDidMount() {
        const { match } = this.props;

        const { issuesPage, issuesStatus } = this.state;

        const repoName = decodeURIComponent(match.params.repository);

        const [repository, issues] = await Promise.all([
            await api.get(`/repos/${repoName}`),
            await api.get(`/repos/${repoName}/issues`, {
                params: {
                    state: issuesStatus,
                    per_page: 5,
                    page: issuesPage,
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
            issuesStatus: value,
        });

        this.atualizarPage();

        this.setState({
            loading: false,
        });
    };

    changePage = async page => {
        const { issuesPage } = this.state;

        let pagina = issuesPage;

        if (page === 'anterior') {
            pagina -= 1;
        } else if (page === 'próximo') {
            pagina += 1;
        }

        if (pagina < 1) {
            pagina = 1;
        }

        await this.setState({
            issuesPage: pagina,
        });

        this.atualizarPage();
    };

    atualizarPage = async () => {
        const { repository, issuesStatus, issuesPage } = this.state;

        const issues = await api.get(`/repos/${repository.full_name}/issues`, {
            params: {
                state: issuesStatus,
                per_page: 5,
                page: issuesPage,
            },
        });

        this.setState({
            issues: issues.data,
        });
    };

    render() {
        const { loading, repository, issues, issuesPage } = this.state;

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
                <PaginationButtons>
                    <button
                        type="button"
                        onClick={() => this.changePage('anterior')}
                        page={issuesPage}
                    >
                        Anterior
                    </button>
                    <button
                        type="button"
                        onClick={() => this.changePage('próximo')}
                    >
                        Próximo
                    </button>
                </PaginationButtons>
            </Container>
        );
    }
}
