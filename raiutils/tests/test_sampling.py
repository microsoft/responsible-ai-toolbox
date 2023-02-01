# Copyright (c) Microsoft Corporation
# Licensed under the MIT License.

import numpy as np
import pandas as pd

from raiutils.sampling import generate_random_sample


class TestRandomSampling:
    def validate_sampled_data(
            self, original_data, sampled_data, num_requested_samples):
        if original_data.shape[0] > num_requested_samples:
            assert sampled_data.shape[0] == num_requested_samples
        else:
            assert sampled_data.shape[0] == original_data.shape[0]
        assert sampled_data.shape[1] == original_data.shape[1]
        assert isinstance(sampled_data, type(original_data))

    def generate_dataset(self, is_classification=False, is_skewed=False):
        """Generate a classification/regression dataset."""
        X1 = np.arange(1000)
        if is_classification:
            y = np.round(np.sin(X1)).astype('int')
        else:
            y = np.sin(X1)

        if is_classification and is_skewed:
            y[0] = 2

        X2 = np.cos(X1)
        X3 = np.cos(X1)

        train_numpy = np.hstack((
            y.reshape(-1, 1),
            X2.reshape(-1, 1),
            X3.reshape(-1, 1)))
        train = pd.DataFrame(
            data=train_numpy, columns=['target_column', 'col2', 'col3'])
        target_column_name = 'target_column'

        if is_classification:
            classes = np.unique(y).tolist()
        else:
            classes = None

        return train, target_column_name, classes

    def test_generate_random_sample_classification(self):
        dataset, target_column_name, classes = self.generate_dataset(
            is_classification=True)
        sampled_dataset = generate_random_sample(
            dataset=dataset, target_column=target_column_name,
            number_samples=500,
            is_classification=True)
        self.validate_sampled_data(
            original_data=dataset,
            sampled_data=sampled_dataset,
            num_requested_samples=500)
        for some_class in classes:
            assert some_class in sampled_dataset['target_column'].values

    def test_generate_random_sample_classification_skewed_data(self):
        dataset, target_column_name, classes = self.generate_dataset(
            is_classification=True, is_skewed=True)
        sampled_dataset = generate_random_sample(
            dataset=dataset, target_column=target_column_name,
            number_samples=500,
            is_classification=True)
        self.validate_sampled_data(
            original_data=dataset,
            sampled_data=sampled_dataset,
            num_requested_samples=500)
        for some_class in classes:
            assert some_class in sampled_dataset['target_column'].values

    def test_generate_random_sample_regression(self):
        dataset, target_column_name, _ = self.generate_dataset(
            is_classification=True)
        sampled_dataset = generate_random_sample(
            dataset=dataset, target_column=target_column_name,
            number_samples=500,
            is_classification=False)
        self.validate_sampled_data(
            original_data=dataset,
            sampled_data=sampled_dataset,
            num_requested_samples=500)

        same_dataset = generate_random_sample(
            dataset=dataset, target_column=target_column_name,
            number_samples=5000,
            is_classification=False)
        self.validate_sampled_data(
            original_data=dataset,
            sampled_data=same_dataset,
            num_requested_samples=5000)
