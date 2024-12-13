import { Body, Controller, Delete, Get, Param, Put, Query, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { TransactionListService } from './transaction-list.service';
import { AuthGuard } from '@nestjs/passport';
import { QueryTransactionListDto, UpdateTransactionListDto } from './dto';

@ApiTags('Transaction List')
@ApiBearerAuth()
@Controller('transaction-list')
export class TransactionListController {
    constructor(private transactionListService: TransactionListService) { }

    @UseGuards(AuthGuard('jwt'))
    @Get()
    findAll(@Query() query: QueryTransactionListDto, @Req() { user }: any) {
        return this.transactionListService.findAll(query, user);
    }

    @UseGuards(AuthGuard('jwt'))
    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.transactionListService.findOne(+id);
    }

    @UseGuards(AuthGuard('jwt'))
    @Put(':id')
    update(@Param('id') id: string, @Body() data: UpdateTransactionListDto) {
        return this.transactionListService.update(+id, data);
    }

    @UseGuards(AuthGuard('jwt'))
    @Delete(':id')
    delete(@Param('id') id: string) {
        return this.transactionListService.delete(+id);
    }
}
