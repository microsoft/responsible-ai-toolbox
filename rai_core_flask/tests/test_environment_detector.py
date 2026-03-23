# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import os

import pytest

from rai_core_flask import FlaskHelper
from rai_core_flask.environments.azure_nb_environment import AzureNBEnvironment
from rai_core_flask.environments.credentialed_vm_environment import \
    CredentialedVMEnvironment
from rai_core_flask.environments.databricks_environment import (
    DATABRICKS_ENV_VAR, DatabricksEnvironment)
from rai_core_flask.environments.local_ipython_environment import \
    LocalIPythonEnvironment
from rai_core_flask.environments.public_vm_environment import \
    PublicVMEnvironment


class TestEnvironmentDetector(object):

    def test_credentialed_vm(self):
        service = FlaskHelper(with_credentials=True)
        assert isinstance(service.env, CredentialedVMEnvironment)

    def test_public_vm(self, mocker):
        mocker.patch('rai_core_flask.FlaskHelper._is_local_port_available',
                     return_value=True)
        service = FlaskHelper(ip="not localhost", with_credentials=False)
        assert isinstance(service.env, PublicVMEnvironment)

    def test_public_vm_fail_on_port(self, mocker):
        mocker.patch('rai_core_flask.FlaskHelper._is_local_port_available',
                     return_value=False)
        with pytest.raises(RuntimeError) as exception:
            FlaskHelper(ip="not localhost", with_credentials=False)
        assert "Ports 8704 to 8993 not available." in \
            exception.value.args[0]

    def test_local(self):
        service = FlaskHelper()
        assert isinstance(service.env, LocalIPythonEnvironment)

    def test_azure_nb(self, mocker):
        mocker.patch('os.path.exists', return_value=True)
        mocker.patch('os.path.isfile', return_value=True)
        mocker.patch(
            'rai_core_flask.environments.azure_nb_environment.'
            'AzureNBEnvironment.get_nbvm_config',
            return_value={
                'instance': "fakeaznbinstance",
                'domainsuffix': "fakedomainsuffix"})
        service = FlaskHelper()
        assert isinstance(service.env, AzureNBEnvironment)
        assert service.with_credentials

    def test_databricks(self):
        try:
            os.environ[DATABRICKS_ENV_VAR] = "mock"
            service = FlaskHelper()
            assert isinstance(service.env, DatabricksEnvironment)
        finally:
            del os.environ[DATABRICKS_ENV_VAR]

    def test_local_cors_restricted_by_default(self):
        service = FlaskHelper()
        assert isinstance(service.env, LocalIPythonEnvironment)
        assert not service.allow_all_origins

        # Verify allowed localhost origin gets CORS header
        with service.app.test_client() as client:
            resp = client.get('/', headers={'Origin': 'http://localhost:8888'})
            assert resp.headers.get('Access-Control-Allow-Origin') == \
                'http://localhost:8888'

            # Verify disallowed origin does NOT get CORS header
            resp = client.get('/', headers={'Origin': 'http://evil.com'})
            assert resp.headers.get('Access-Control-Allow-Origin') is None

            # Verify attacker origin with similar IP does NOT match
            resp = client.get('/',
                              headers={'Origin': 'http://127a0b0c1:1234'})
            assert resp.headers.get('Access-Control-Allow-Origin') is None

    def test_local_cors_wildcard_when_opted_in(self):
        service = FlaskHelper(allow_all_origins=True)
        assert isinstance(service.env, LocalIPythonEnvironment)
        assert service.allow_all_origins

        # Verify any origin gets CORS header
        with service.app.test_client() as client:
            resp = client.get('/', headers={'Origin': 'http://evil.com'})
            assert resp.headers.get('Access-Control-Allow-Origin') is not None

    def test_public_vm_cors_restricted_by_default(self, mocker):
        mocker.patch('rai_core_flask.FlaskHelper._is_local_port_available',
                     return_value=True)
        service = FlaskHelper(ip="10.0.0.5", with_credentials=False)
        assert isinstance(service.env, PublicVMEnvironment)
        assert not service.allow_all_origins

        # Verify allowed origin gets CORS header
        with service.app.test_client() as client:
            resp = client.get('/',
                              headers={'Origin': 'http://10.0.0.5:8888'})
            assert resp.headers.get('Access-Control-Allow-Origin') == \
                'http://10.0.0.5:8888'

            # Verify disallowed origin does NOT get CORS header
            resp = client.get('/', headers={'Origin': 'http://evil.com'})
            assert resp.headers.get('Access-Control-Allow-Origin') is None

            # Verify attacker prefix origin does NOT match
            resp = client.get(
                '/', headers={'Origin': 'http://10.0.0.5.evil.com'})
            assert resp.headers.get('Access-Control-Allow-Origin') is None

    def test_public_vm_cors_wildcard_when_opted_in(self, mocker):
        mocker.patch('rai_core_flask.FlaskHelper._is_local_port_available',
                     return_value=True)
        service = FlaskHelper(ip="10.0.0.5", with_credentials=False,
                              allow_all_origins=True)
        assert isinstance(service.env, PublicVMEnvironment)
        assert service.allow_all_origins

        # Verify any origin gets CORS header
        with service.app.test_client() as client:
            resp = client.get('/', headers={'Origin': 'http://evil.com'})
            assert resp.headers.get('Access-Control-Allow-Origin') is not None
