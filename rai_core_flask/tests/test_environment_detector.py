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
