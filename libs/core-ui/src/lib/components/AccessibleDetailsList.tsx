// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import {
  DetailsList,
  Dialog,
  DialogFooter,
  DialogType,
  IDetailsList,
  IDetailsListProps,
  IColumn,
  PrimaryButton,
  DefaultButton,
  ColumnActionsMode,
  TextField
} from "@fluentui/react";
import { localization } from "@responsible-ai/localization";
import * as React from "react";

const RADIX = 10;
const DefaultColumnMinWidth = 10;

type IAccessibleDetailsListProps = IDetailsListProps;

interface IAccessibleDetailsListState {
  isDialogHidden: boolean;
  columnToResize?: IColumn;
  newWidth?: number;
  errorMessage?: string;
}

export class AccessibleDetailsList extends React.PureComponent<
  IAccessibleDetailsListProps,
  IAccessibleDetailsListState
> {
  private detailsListRef = React.createRef<IDetailsList>();
  public constructor(props: IAccessibleDetailsListProps) {
    super(props);

    this.state = {
      columnToResize: undefined,
      errorMessage: undefined,
      isDialogHidden: true,
      newWidth: undefined
    };
  }

  public render(): React.ReactNode {
    const { columns, ...rest } = this.props;
    const clickableColumns = columns?.map((column) => {
      column.onColumnClick = this.onColumnClick;
      column.columnActionsMode = ColumnActionsMode.clickable;
      return column;
    });

    return (
      <div>
        <DetailsList
          componentRef={this.detailsListRef}
          columns={clickableColumns}
          {...rest}
        />
        <Dialog
          hidden={this.state.isDialogHidden}
          onDismiss={this.closeDialog}
          dialogContentProps={{
            subText:
              localization.Core.AccessibleDetailsList.ResizableDialog.subText,
            title:
              localization.Core.AccessibleDetailsList.ResizableDialog.title,
            type: DialogType.normal
          }}
        >
          <TextField
            ariaLabel={
              localization.Core.AccessibleDetailsList.ResizableDialog.subText
            }
            errorMessage={this.state.errorMessage}
            onChange={this.onTextFieldChange}
          />
          <DialogFooter>
            <PrimaryButton
              onClick={this.confirmDialog}
              text={localization.Core.AccessibleDetailsList.resize}
              ariaLabel={localization.Core.AccessibleDetailsList.resize}
              disabled={this.state.errorMessage !== undefined}
            />
            <DefaultButton
              onClick={this.closeDialog}
              text={localization.Core.AccessibleDetailsList.cancel}
              ariaLabel={localization.Core.AccessibleDetailsList.cancel}
            />
          </DialogFooter>
        </Dialog>
      </div>
    );
  }

  private getMinMaxErrorMessage = (
    column: IColumn,
    columnMinWidth: number
  ): string => {
    return localization.formatString(
      localization.Core.AccessibleDetailsList.minMaxErrorMessage,
      columnMinWidth,
      column.maxWidth
    );
  };

  private getMinErrorMessage = (columnMinWidth: number): string => {
    return localization.formatString(
      localization.Core.AccessibleDetailsList.minErrorMessage,
      columnMinWidth
    );
  };

  private onColumnClick = (
    _: React.MouseEvent<HTMLElement>,
    column: IColumn
  ): void => {
    const columnMinWidth = column.minWidth ?? DefaultColumnMinWidth;
    let errorMessage = "";
    if (column.maxWidth) {
      errorMessage = this.getMinMaxErrorMessage(column, columnMinWidth);
    } else {
      errorMessage = this.getMinErrorMessage(columnMinWidth);
    }
    this.setState({
      columnToResize: column,
      errorMessage,
      isDialogHidden: false
    });
  };

  private onTextFieldChange = (
    _: React.FormEvent<HTMLInputElement | HTMLTextAreaElement>,
    newValue?: string
  ): void => {
    if (newValue) {
      const newWidth = Number.parseInt(newValue, RADIX);
      const column = this.state.columnToResize;
      const columnMinWidth = column?.minWidth ?? DefaultColumnMinWidth;
      if (column?.maxWidth) {
        if (newWidth > column.maxWidth || newWidth < columnMinWidth) {
          this.setState({
            errorMessage: this.getMinMaxErrorMessage(column, columnMinWidth),
            newWidth: undefined
          });
          return;
        }
      } else if (newWidth < columnMinWidth) {
        this.setState({
          errorMessage: this.getMinErrorMessage(columnMinWidth),
          newWidth: undefined
        });
        return;
      }
      if (newWidth) {
        this.setState({ errorMessage: undefined, newWidth });
      }
    }
  };

  private confirmDialog = (): void => {
    if (this.state.columnToResize && this.state.newWidth) {
      const columnToResize = this.state.columnToResize;
      this.detailsListRef.current?.updateColumn(columnToResize, {
        width: this.state.newWidth
      });
      this.closeDialog();
    }
  };

  private closeDialog = (): void => {
    this.setState({
      columnToResize: undefined,
      isDialogHidden: true,
      newWidth: undefined
    });
  };
}
